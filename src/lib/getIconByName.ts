import type { SVGProps, FC } from 'react';
import {
  FaLocationCrosshairs,
  FaPenToSquare,
  FaPlus,
  FaRegTrashCan,
  FaXmark,
} from 'react-icons/fa6';

import TrafficSignCrossing from '@/assets/icons/traffic-sign-crossing.svg';
import TrafficSignDanger from '@/assets/icons/traffic-sign-danger.svg';
import TrafficSignSlope from '@/assets/icons/traffic-sign-slope.svg';

type IconComponent = FC<SVGProps<SVGSVGElement>>;

const ICONS = {
  close: FaXmark,
  delete: FaRegTrashCan,
  edit: FaPenToSquare,
  plus: FaPlus,
  userLocation: FaLocationCrosshairs,
  trafficSignSlope: TrafficSignSlope as IconComponent,
  trafficSignDanger: TrafficSignDanger as IconComponent,
  trafficSignCrossing: TrafficSignCrossing as IconComponent,
} as const;

export type IconName = keyof typeof ICONS;

export function getIconByName(iconName: IconName) {
  return ICONS[iconName];
  // const Icon = ICONS[iconName as keyof typeof ICONS];
  // if (!Icon) {
  //   throw new Error(`Icon ${iconName} not found`);
  // }

  // return Icon;
}
