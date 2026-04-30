import type { ReactNode } from 'react';

import styles from './SimpleContent.module.css';

export default function SimpleContent({ children }: { children: ReactNode }) {
  return <div className={styles.simpleContent}>{children}</div>;
}
