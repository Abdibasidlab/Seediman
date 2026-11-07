import type { ImmersiveLesson } from './lessonTypes';
import { TAWHEED_1 } from './tawheed1';
import { TAWHEED_2 } from './tawheed2';
import { TAWHEED_3 } from './tawheed3';
import { TAWHEED_4 } from './tawheed4';
import { TAWHEED_5 } from './tawheed5';
import { TAWHEED_6 } from './tawheed6';
import { TAWHEED_7 } from './tawheed7';

/** Immersive lessons in path order. Add the next level here when its data file exists. */
export const TAWHEED_LEVELS: ImmersiveLesson[] = [TAWHEED_1, TAWHEED_2, TAWHEED_3, TAWHEED_4, TAWHEED_5, TAWHEED_6, TAWHEED_7];
export const ALL_LESSONS: ImmersiveLesson[] = [...TAWHEED_LEVELS];
