import { attrDefTemplateId, coreTemplateId } from './types/constants';
import { Field, FieldEntry, TanaNode } from './types/types';
import fetch from 'node-fetch';

export class TanaAPIHelper {
  private endpoint = 'https://europe-west1-tagr-prod.cloudfunctions.net/addToNodeV2';

  private get schemaNodeId() {
    return `${this.workspaceId}_SCHEMA`;
  }

  private get stashNodeId() {
    return `${this.workspaceId}_STASH`;
  }

  constructor(public token: string, public workspaceId: string, public endpointUrl?: string) {
    this.token = token;
    this.workspaceId = workspaceId;
    if (endpointUrl) {
      this.endpoint = endpointUrl;
    }
  }

  async createFields(fields: Field[]) {
    const payload = {
      targetNodeId: this.schemaNodeId,
      targetFileId: this.workspaceId,
      nodes: fields.map((field) => ({
        name: field.name,
        description: field.description,
        supertags: [{ id: attrDefTemplateId }],
      })),
    };

    const createdFields = await this.makeRequest(payload);

    return createdFields.map((field: any) => ({
      name: field.name,
      description: field.description,
      id: field.nodeId,
    }));
  }

  async createTag(name: string, description: string, fields: Field[]) {
    const payload = {
      targetNodeId: this.schemaNodeId,
      targetFileId: this.workspaceId,
      nodes: [
        {
          name,
          description,
          supertags: [{ id: coreTemplateId }],
          children: fields.map((field) => ({
            type: 'field',
            attributeId: field.id,
            children: [
              {
                name: '', // default value would go here
              },
            ],
          })),
        },
      ],
    };

    const createdTag = await this.makeRequest(payload);
    return createdTag[0].nodeId;
  }

  async createNode(
    name: string,
    description: string,
    children: (FieldEntry | TanaNode)[],
    options: { tagId?: string; targetNodeId?: string } = {},
  ) {
    const payload = {
      targetNodeId: options.targetNodeId || this.stashNodeId,
      targetFileId: this.workspaceId,
      nodes: [
        {
          name,
          description,
          supertags: options.tagId ? [{ id: options.tagId }] : [],
          children: children.map((child) => {
            if ('id' in child) {
              return {
                type: 'field',
                attributeId: child.id,
                children: [
                  {
                    name: child.value,
                  },
                ],
              };
            } else {
              return child;
            }
          }),
        },
      ],
    };

    const createdNode = await this.makeRequest(payload);
    return createdNode[0];
  }

  private async makeRequest(payload: any): Promise<TanaNode[]> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (response.status === 200 || response.status === 201) {
        return response.json();
      }
      throw new Error(`${response.status} ${response.statusText}`);
    });
    return (response as any).children as TanaNode[];
  }
}
