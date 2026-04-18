export interface TraitDefinition {
  name: string;
  description?: string;
  dependent?: string[];
}

export type TraitValue = string | TraitDefinition;

export type TraitMapping = Record<string, TraitValue>;
