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
      <Icon />
    </button>
  );
}
