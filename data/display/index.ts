import { CategoryKey, DisplayLibrary } from '@/types/traits';

import { moodDisplay as mood } from './mood';
import { bodyDisplay as bodyType } from './body';
import { shouldersDisplay as shoulders } from './shoulders';
import { chestDisplay as chest } from './chest';
import { armsDisplay as arms } from './arms';
import { waistDisplay as waist } from './waist';
import { hipsDisplay as hips } from './hips';
import { legsDisplay as legs } from './legs';
import { skinDisplay as skinType } from './skin';
import { hairStyleDisplay as hairStyle } from './hair';
import { hairColorDisplay as hairColor } from './hair-color';
import { faceGeoDisplay as faceGeo } from './face';
import { eyesDisplay as eyes } from './eyes';
import { expressionDisplay as expression } from './expression';
import { poseDisplay as pose } from './pose';
import { clothingDisplay as clothing } from './clothing';
import { specialDisplay as special } from './special';

export const displayLibrary: Record<CategoryKey, DisplayLibrary> = {
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