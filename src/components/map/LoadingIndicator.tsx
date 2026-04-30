import React from 'react';

import Spinner from '@/components/Spinner';

import styles from './LoadingIndicator.module.css';

export default function LoadingIndicator({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.loader}>
      <Spinner />
      {children}
    </div>
  );
}
