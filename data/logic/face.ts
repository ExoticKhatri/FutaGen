// data/logic/face.ts
import { VariantLogic } from '@/types/traits';

export const faceGeoLogic: VariantLogic[] = [
  { id: '000', hasDependency: false }, // AI Select (Default)
  {
    id: '001', // Heart-Shaped (Classic Succubus)
    hasDependency: true,
    whitelist: {
      eyes: ['001', '002', '004', '005'] // Doe eyes, Alluring, Heart-pupils
    }
  },
  {
    id: '002', // Sharp / Angular
    hasDependency: true,
    whitelist: {
      eyes: ['003', '006', '008'] // Narrow, Slit, Triple-eyes
    }
  },
  {
    id: '003', // Bestial / Snouted
    hasDependency: true,
    whitelist: {
      eyes: ['006', '007', '009'] // Reptilian, Glowing, Void
    }
  },
  { id: '004', hasDependency: false }, // Round / Soft (Doll-like)
  { id: '005', hasDependency: false }, // Elongated / Alien
  { id: '006', hasDependency: false }, // Chiseled (Strong jawline)
  { id: '007', hasDependency: false }, // Masked (Face is a hard shell)
  { id: '008', hasDependency: false }, // Gaunt / Sunken
  { id: '009', hasDependency: false }, // Asymmetrical (Chaotic growth)
];