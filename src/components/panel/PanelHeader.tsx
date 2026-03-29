import PanelIconButton from './PanelIconButton';
import styles from './PanelHeader.module.css';

interface ActionButton {
  iconName: string;
  onClick: () => void;
  ariaLabel: string;
}

interface Props {
  title: string;
  onClose: () => void;
  actionButtons?: ActionButton[];
}

export default function PanelHeader({ title, onClose, actionButtons = [] }: Props) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.actions}>
        {actionButtons.map((btn) => (
          <PanelIconButton
            key={btn.iconName}
            onClick={btn.onClick}
            ariaLabel={btn.ariaLabel}
            iconName={btn.iconName}
          />
        ))}
        <PanelIconButton onClick={onClose} ariaLabel="Sluiten" iconName="close" />
      </div>
    </div>
  );
}
