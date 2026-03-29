import PanelIconButton from './PanelIconButton';
import styles from './PanelHeader.module.css';

interface Props {
  title: string;
  onClose: () => void;
}

export default function PanelHeader({ title, onClose }: Props) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.actions}>
        <PanelIconButton onClick={onClose} ariaLabel="Sluiten" iconName="close" />
      </div>
    </div>
  );
}
