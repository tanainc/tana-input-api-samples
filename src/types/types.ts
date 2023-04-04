export type Field = {
  id?: string;
  name: string;
  description: string;
};

export type FieldEntry = {
  id: string;
  value: string;
};

export type TanaNode = {
  nodeId?: string;
  name: string;
  description: string;
  children?: TanaNode[];
};
