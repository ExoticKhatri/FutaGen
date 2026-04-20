import { CategoryKey, VariantLogic } from '@/types/traits';

import { moodLogic as mood } from './mood';
import { bodyLogic as bodyType } from './body';
import { shouldersLogic as shoulders } from './shoulders';
import { chestLogic as chest } from './chest';
import { armsLogic as arms } from './arms';
import { waistLogic as waist } from './waist';
import { hipsLogic as hips } from './hips';
import { legsLogic as legs } from './legs';
import { skinLogic as skinType } from './skin';
import { hairLogic as hairStyle } from './hair';
import { hairColorLogic as hairColor } from './hair-color';
import { faceLogic as faceGeo } from './face';
import { eyesLogic as eyes } from './eyes';
import { expressionLogic as expression } from './expression';
import { poseLogic as pose } from './pose';
import { clothingLogic as clothing } from './clothing';
import { specialLogic as special } from './special';

export const logicLibrary: Record<CategoryKey, VariantLogic[]> = {
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