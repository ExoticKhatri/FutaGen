// data/logic/body.ts
import { VariantLogic } from '@/types/traits';

export const bodyLogic: VariantLogic[] = [
  { id: '000', hasDependency: false }, // AI Select (Default)
  {
    id: '001', // Slender / Petite
    hasDependency: true,
    whitelist: {
      shoulders: ['001', '002'], // Narrow variants
      chest:     ['001', '002'], // Small variants
      arms:      ['001'],        // Thin variants
      waist:     ['001', '002'], // Tiny variants
      hips:      ['001', '002'], // Slim variants
      legs:      ['001']         // Lean variants
    }
  },
  {
    id: '002', // Athletic / Toned
    hasDependency: true,
    whitelist: {
      shoulders: ['003', '004'], // Defined variants
      chest:     ['003'],        // Firm variants
      arms:      ['002', '003'], // Toned/Muscular variants
      waist:     ['003'],        // Fit variants
      hips:      ['003'],        // Athletic variants
      legs:      ['002', '003']  // Strong variants
    }
  },
  {
    id: '003', // Curvy / Hourglass
    hasDependency: true,
    whitelist: {
      shoulders: ['002', '003'],
      chest:     ['004', '005', '006'], // Larger variants
      arms:      ['001', '002'],
      waist:     ['001', '002'],        // Snatched variants
      hips:      ['005', '006', '007'], // Wide variants
      legs:      ['004', '005']         // Thicker variants
    }
  },
  { id: '004', hasDependency: false }, // Amazonian (Tall/Large)
  { id: '005', hasDependency: false }, // Heroic (Broad/V-Shape)
  { id: '006', hasDependency: false }, // Soft/Chubby
  { id: '007', hasDependency: false }, // Supernatural (Extremely Thin/Ethereal)
  { id: '008', hasDependency: false }, // Demonic/Heavy (Monster-like mass)
  { id: '009', hasDependency: false }, // Compact/Short
];