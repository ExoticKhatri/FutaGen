// data/logic/expression.ts
import { VariantLogic } from '@/types/traits';

export const expressionLogic: VariantLogic[] = [
  { id: '000', hasDependency: false }, // Default
  { id: '001', hasDependency: false }, // Angry/Fury (Aggressive)
  { id: '002', hasDependency: false }, // Menacing Snarl (Aggressive)
  { id: '003', hasDependency: false }, // Wicked Grin (Aggressive)
  { id: '004', hasDependency: false }, // Soft Smile (Serene)
  { id: '005', hasDependency: false }, // Eyes Closed/Zen (Serene)
  { id: '006', hasDependency: false }, // Winking (Playful)
  { id: '007', hasDependency: false }, // Teasing/Tongue Out (Playful)
  { id: '008', hasDependency: false }, // Bored/Apathetic
  { id: '009', hasDependency: false }, // Terrifying/Uncanny
];