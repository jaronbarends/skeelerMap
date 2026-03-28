import { FaPlus } from 'react-icons/fa6';

const ICONS = {
  plus: FaPlus,
} as const;

export function getIconByName(iconName: string) {
  const Icon = ICONS[iconName as keyof typeof ICONS];
  if (!Icon) {
    throw new Error(`Icon ${iconName} not found`);
  }

  return Icon;
}
