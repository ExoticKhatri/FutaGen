// data/logic/legs.ts
import { VariantLogic } from '@/types/traits';

export const legsLogic: VariantLogic[] = [
  { id: '000', hasDependency: false }, // Default
  { id: '001', hasDependency: false }, // Lean/Slender (Humanoid)
  { id: '002', hasDependency: false }, // Athletic/Toned (Humanoid)
  { id: '003', hasDependency: false }, // Powerful/Muscular (Humanoid)
  { id: '004', hasDependency: false }, // Thick/Thundrous (Humanoid)
  { id: '005', hasDependency: false }, // Digitigrade (Animal-like joints)
  { id: '006', hasDependency: false }, // Cloven Hooves (Classic Demonic)
  { id: '007', hasDependency: false }, // Taloned/Raptor (Bird of prey style)
  { id: '008', hasDependency: false }, // Ethereal/Mist (No feet, just trailing smoke)
  { id: '009', hasDependency: false }, // Obsidian/Crystal (Hard mineral legs)
];