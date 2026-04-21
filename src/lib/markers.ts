import type { IconName } from '@/lib/getIconByName';

export const MARKER_TYPES = {
  danger: {
    iconName: 'trafficSignDanger',
    title: 'Gevaarlijk punt',
  },
  slope: {
    iconName: 'trafficSignSlope',
    title: 'Steile helling',
  },
  crossing: {
    iconName: 'trafficSignCrossing',
    title: 'Gevaarlijke kruising',
  },
} as const satisfies Record<string, { iconName: IconName; title: string }>;

export type MarkerType = keyof typeof MARKER_TYPES;

export interface Marker {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  type: MarkerType;
  description: string | null;
}
