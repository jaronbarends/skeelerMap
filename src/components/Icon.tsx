import { getIconByName, type IconName } from '@/lib/getIconByName';

import styles from './Icon.module.css';

type IconSize = 24 | 32;

interface Props {
  iconName: IconName;
  size?: IconSize;
}
export default function Icon({ iconName, size }: Props) {
  const IconComponent = getIconByName(iconName);
  const sizeStyle = size ? { '--icon-size': `var(--size-${size})` } : {};
  return (
    <div className={styles.icon} style={sizeStyle}>
      {IconComponent({})}
    </div>
  );
}
