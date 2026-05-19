/** Shared type for ref data files */
export type TraitValue  = string | { name: string; description: string };
export type TraitMapping = Record<string, TraitValue>;
