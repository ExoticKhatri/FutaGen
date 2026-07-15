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
  | 'prompt_done'
  | 'error';

export type SlotStatus = 'pending' | 'running' | 'done' | 'error';

export interface ImageSlot {
  status: SlotStatus;
  imageUrl: string | null;
  error: string | null;
}

export interface ImageGenState {
  status: GenerationStatus;
  message: string;
  imageUrl: string | null;
  prompt: string | null;
  rawInput: string | null;
  attempt: number;
  slots: ImageSlot[];
}

export interface GeneratorState {
  seed: string;
  composition: string;
  frame: string;
  style: string;
  background: string;
  /** How many characters the current seed encodes (group size). */
  characterCount: number;
  /** Traits for the character currently being edited in the Trait Selector. */
  traits: MappedTraits | null;
  traitTitles: TraitTitles | null;
  /** Resolved traits for every character in the group, index-aligned to characterCount. */
  charactersTraits: MappedTraits[];
  charactersTraitTitles: TraitTitles[];
}

export const INITIAL_GENERATOR_STATE: GeneratorState = {
  seed: "",
  composition: "portrait",
  frame: "portrait",
  style: "glistening_anime",
  background: "plain_white",
  characterCount: 1,
  traits: null,
  traitTitles: null,
  charactersTraits: [],
  charactersTraitTitles: [],
};

export const INITIAL_IMAGE_GEN_STATE: ImageGenState = {
  status: 'idle',
  message: '',
  imageUrl: null,
  prompt: null,
  rawInput: null,
  attempt: 0,
  slots: [],
};
