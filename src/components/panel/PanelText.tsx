import { type ReactNode } from 'react';

import Spinner from '@/components/Spinner';

import styles from './PanelText.module.css';

interface Props {
  isPending: boolean;
  children: ReactNode;
}

export default function PanelText({ isPending, children }: Props) {
  return (
    <div className={styles.panelText}>
      {isPending && <Spinner />}
      {children}
    </div>
  );
}
