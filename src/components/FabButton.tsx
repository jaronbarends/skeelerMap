import { getIconByName } from '@/lib/getIconByName';

import styles from './FabButton.module.css';

export default function FabButton({
  onClick,
  ariaLabel,
  disabled,
  iconName,
}: {
  onClick: () => void;
  ariaLabel: string;
  disabled: boolean;
  iconName: string;
}) {
  const Icon = getIconByName(iconName);

  return (
    <button className={styles.component} aria-label={ariaLabel} {...{ onClick, disabled }}>
      {/* Next.js's built-in compiler throws an error ("Cannot create components during render") if you use <Icon /> here, so we use {Icon({})} instead. */}
      {Icon({})}
    </button>
  );
}
