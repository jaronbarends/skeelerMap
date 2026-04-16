import type { ReactNode } from 'react';

import styles from './PanelBody.module.css';

interface Props {
  children: ReactNode;
}

export default function PanelBody({ children }: Props) {
  return <div className={styles.body}>{children}</div>;
}
