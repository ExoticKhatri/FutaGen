// data/logic/pose.ts
import { VariantLogic } from '@/types/traits';

export const poseLogic: VariantLogic[] = [
  { id: '000', hasDependency: false }, // Default
  { id: '001', hasDependency: false }, // Combat Stance (Aggressive)
  { id: '002', hasDependency: false }, // Intimidating Lean (Aggressive)
  { id: '003', hasDependency: false }, // Meditating / Hovering (Serene)
  { id: '004', hasDependency: false }, // Floating / Relaxed (Serene)
  { id: '005', hasDependency: false }, // Dynamic Dance (Playful)
  { id: '006', hasDependency: false }, // Waving / Greeting (Playful)
  { id: '007', hasDependency: false }, // Crouched / Feral
  { id: '008', hasDependency: false }, // Regal Throne Sit
  { id: '009', hasDependency: false }, // Looking Back over Shoulder
];