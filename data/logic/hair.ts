// data/logic/hair-style.ts
import { VariantLogic } from '@/types/traits';

export const hairStyleLogic: VariantLogic[] = [
  { id: '000', hasDependency: false }, // AI Select (Default)
  { id: '001', hasDependency: false }, // Long & Straight
  { id: '002', hasDependency: false }, // Messy Twin Tails
  { id: '003', hasDependency: false }, // Short Pixie Cut
  { id: '004', hasDependency: false }, // High Ponytail (Warrior style)
  { id: '005', hasDependency: false }, // Floating / Weightless Strands
  { id: '006', hasDependency: false }, // Braided Crown (Regal)
  { id: '007', hasDependency: false }, // Wild / Unkempt Mane
  { id: '008', hasDependency: false }, // Bob with Blunt Bangs
  { id: '009', hasDependency: false }, // Living Serpents / Tendrils
];