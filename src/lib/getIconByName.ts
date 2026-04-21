import {
  FaCircleInfo,
  FaLocationCrosshairs,
  FaPenToSquare,
  FaPlus,
  FaRegTrashCan,
  FaXmark,
} from 'react-icons/fa6';

import TrafficSignCrossing from '@/assets/icons/traffic-sign-crossing.svg';
import TrafficSignDanger from '@/assets/icons/traffic-sign-danger.svg';
import TrafficSignSlope from '@/assets/icons/traffic-sign-slope.svg';

const ICONS = {
  close: FaXmark,
  delete: FaRegTrashCan,
  edit: FaPenToSquare,
  info: FaCircleInfo,
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
