import type { ReactNode } from 'react';

import type { IconName } from '@/lib/getIconByName';

import PanelIconButton from './PanelIconButton';

import styles from './PanelHeader.module.css';

export interface ActionButton {
  iconName: IconName;
  onClick: () => void;
  ariaLabel: string;
}

interface Props {
  onClose: () => void;
  actionButtons?: ActionButton[];
  children?: ReactNode;
}

export default function PanelHeader({ onClose, actionButtons = [], children }: Props) {
  return (
    <div className={styles.header}>
      {children}
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
