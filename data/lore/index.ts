import { CategoryKey, LoreLibrary } from '@/types/traits';

import { moodLore as mood } from './mood';
import { bodyLore as bodyType } from './body';
import { shouldersLore as shoulders } from './shoulders';
import { chestLore as chest } from './chest';
import { armsLore as arms } from './arms';
import { waistLore as waist } from './waist';
import { hipsLore as hips } from './hips';
import { legsLore as legs } from './legs';
import { skinLore as skinType } from './skin';
import { hairStyleLore as hairStyle } from './hair';
import { hairColorLore as hairColor } from './hair-color';
import { faceGeoLore as faceGeo } from './face';
import { eyesLore as eyes } from './eyes';
import { expressionLore as expression } from './expression';
import { poseLore as pose } from './pose';
import { clothingLore as clothing } from './clothing';
import { specialLore as special } from './special';

export const displayLibrary: Record<CategoryKey, LoreLibrary> = {
  mood,
  bodyType,
  shoulders,
  chest,
  arms,
  waist,
  hips,
  legs,
  skinType,
  hairStyle,
  hairColor,
  faceGeo,
  eyes,
  expression,
  pose,
  clothing,
  specialSlot1: special,
  specialSlot2: special,
  specialSlot3: special,
};