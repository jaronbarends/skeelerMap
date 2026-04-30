import React from 'react';

import styles from './LoadingIndicator.module.css';

export default function LoadingIndicator({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.loader}>
      <span className={styles.spinner} />
      {children}
    </div>
  );
}
