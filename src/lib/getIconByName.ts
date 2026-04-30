import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaLocationCrosshairs,
  FaPenToSquare,
  FaPlus,
  FaRegTrashCan,
  FaTriangleExclamation,
  FaXmark,
} from 'react-icons/fa6';

import TrafficSignCrossing from '@/assets/icons/traffic-sign-crossing.svg';
import TrafficSignDanger from '@/assets/icons/traffic-sign-danger.svg';
import TrafficSignSlope from '@/assets/icons/traffic-sign-slope.svg';

const ICONS = {
  circleCheck: FaCircleCheck,
  circleExclamation: FaCircleExclamation,
  circleInfo: FaCircleInfo,
  close: FaXmark,
  triangleExclamation: FaTriangleExclamation,
  delete: FaRegTrashCan,
  edit: FaPenToSquare,
  plus: FaPlus,
  userLocation: FaLocationCrosshairs,
  trafficSignSlope: TrafficSignSlope,
  trafficSignDanger: TrafficSignDanger,
  trafficSignCrossing: TrafficSignCrossing,
} as const;

export type IconName = keyof typeof ICONS;

export function getIconByName(iconName: IconName) {
  return ICONS[iconName];
}
