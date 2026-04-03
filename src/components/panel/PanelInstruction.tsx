import { type ReactNode } from 'react';

import styles from './PanelInstruction.module.css';

interface Props {
  children: ReactNode;
}

export default function PanelInstruction({ children }: Props) {
  return <p className={styles.instruction}>{children}</p>;
}
