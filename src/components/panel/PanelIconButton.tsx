import { getIconByName, type IconName } from '@/lib/getIconByName';

import styles from './PanelIconButton.module.css';

interface Props {
  onClick: () => void;
  ariaLabel: string;
  iconName: IconName;
}

export default function PanelIconButton({ onClick, ariaLabel, iconName }: Props) {
  const Icon = getIconByName(iconName);
  return (
    <button className={styles.button} onClick={onClick} aria-label={ariaLabel}>
      {Icon({})}
    </button>
  );
}
