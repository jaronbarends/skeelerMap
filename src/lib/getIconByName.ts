import {
  FaLocationCrosshairs,
  FaPenToSquare,
  FaPlus,
  FaRegTrashCan,
  FaXmark,
} from 'react-icons/fa6';

const ICONS = {
  close: FaXmark,
  delete: FaRegTrashCan,
  edit: FaPenToSquare,
  plus: FaPlus,
  userLocation: FaLocationCrosshairs,
} as const;

export type IconName = keyof typeof ICONS;

export function getIconByName(iconName: string) {
  const Icon = ICONS[iconName as keyof typeof ICONS];
  if (!Icon) {
    throw new Error(`Icon ${iconName} not found`);
  }

  return Icon;
}
