import React from 'react';

import PendingText from '@/components/PendingText';

import styles from './LoadingIndicator.module.css';

export default function LoadingIndicator({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.loader}>
      <PendingText>{children}</PendingText>
    </div>
  );
}
