import { TraitCategory } from './traits';

export interface MappedTraits {
  body: string;
  eyes: string;
  face: string;
  hair: string;
  horns: string;
  mood: string;
  outfit: string;
  pose: string;
  skin: string;
  special: string[];
}

export type TraitTitles = Partial<Record<TraitCategory, string | string[]>>;

export type GenerationStatus =
  | 'idle'
  | 'fetching_traits'
  | 'generating_prompt'
  | 'generating_image'
  | 'done'
  | 'error';

export interface ImageGenState {
  status: GenerationStatus;
  message: string;
  imageUrl: string | null;
  prompt: string | null;
  attempt: number;
}

export interface GeneratorState {
  seed: string;
  composition: string;
  frame: string;
  style: string;
  traits: MappedTraits | null;
  traitTitles: TraitTitles | null;
}

export const INITIAL_GENERATOR_STATE: GeneratorState = {
  seed: "",
  composition: "portrait",
  frame: "portrait",
  style: "minimalist",
  traits: null,
  traitTitles: null,
};

export const INITIAL_IMAGE_GEN_STATE: ImageGenState = {
  status: 'idle',
  message: '',
  imageUrl: null,
  prompt: null,
  attempt: 0,
};
