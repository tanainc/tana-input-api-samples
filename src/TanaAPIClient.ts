import { attrDefTemplateId, coreTemplateId } from './types/constants';
import { APINode, APIPlainNode, TanaNode } from './types/types';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';

function readfile(filename: string) {
  // read filename from disk, return array buffer
  const file = readFileSync(filename, { encoding: 'base64' });

  return file;
}
export class TanaAPIHelper {
  private endpoint = 'https://europe-west1-tagr-prod.cloudfunctions.net/addToNodeV2';

  private get schemaNodeId() {
    return `SCHEMA`;
  }

  constructor(public token: string, public endpointUrl?: string) {
    this.token = token;

    if (endpointUrl) {
      this.endpoint = endpointUrl;
    }
  }

  async createFieldDefinitions(fields: APIPlainNode[]) {
    const payload = {
      targetNodeId: this.schemaNodeId,
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

  async createTagDefinition(node: APIPlainNode) {
    if (!node.supertags) {
      node.supertags = [];
    }
    node.supertags.push({ id: coreTemplateId });
    const payload = {
      targetNodeId: this.schemaNodeId,
      nodes: [node],
    };

    const createdTag = await this.makeRequest(payload);
    return createdTag[0].nodeId;
  }

  async createNode(node: APINode, targetNodeId?: string) {
    const payload = {
      targetNodeId: targetNodeId,
      nodes: [node],
    };

    const createdNode = await this.makeRequest(payload);
    return createdNode[0];
  }

  private async makeRequest(payload: { targetNodeId?: string; nodes: APINode[] }): Promise<TanaNode[]> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 200 || response.status === 201) {
      return ((await response.json()) as any).children as TanaNode[];
    }
    console.log(await response.text());
    throw new Error(`${response.status} ${response.statusText}`);
  }
}
