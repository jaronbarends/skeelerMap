import { ReactNode } from 'react';

import styles from './FabContainer.module.css';

export default function FabContainer({ children }: { children: ReactNode }) {
  return <div className={styles.fabContainer}>{children}</div>;
}
