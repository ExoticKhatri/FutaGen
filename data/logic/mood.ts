// data/logic/mood.ts
import { VariantLogic } from '@/types/traits';

export const moodLogic: VariantLogic[] = [
  { id: '000', hasDependency: false }, // AI Select (Default)
  {
    id: '001', // Aggressive
    hasDependency: true,
    whitelist: {
      expression: ['001', '002', '003'], // e.g., Angry, Snarl, Grin
      pose: ['001', '002'],             // e.g., Combat, Intimidating
    }
  },
  {
    id: '002', // Serene
    hasDependency: true,
    whitelist: {
      expression: ['004', '005'],       // e.g., Closed Eyes, Soft Smile
      pose: ['003', '004'],             // e.g., Meditating, Floating
    }
  },
  {
    id: '003', // Playful
    hasDependency: true,
    whitelist: {
      expression: ['006', '007'],       // e.g., Winking, Tongue Out
      pose: ['005', '006'],             // e.g., Dancing, Waving
    }
  },
  { id: '004', hasDependency: false }, // Melancholy
  { id: '005', hasDependency: false }, // Dominant
  { id: '006', hasDependency: false }, // Submissive
  { id: '007', hasDependency: false }, // Chaotic
  { id: '008', hasDependency: false }, // Elegant
  { id: '009', hasDependency: false }, // Primal
];