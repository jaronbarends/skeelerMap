import { type ReactNode } from 'react';

import PendingText from '@/components/PendingText';

import styles from './LoadingIndicator.module.css';

interface Props {
  children: ReactNode;
  testId?: string;
}

export default function LoadingIndicator({ children, testId }: Props) {
  return (
    <div className={styles.loader} data-testid={testId}>
      <PendingText>{children}</PendingText>
    </div>
  );
}
