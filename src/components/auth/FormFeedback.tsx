import type { ReactNode } from 'react';

import styles from './FormFeedback.module.css';

export type FeedbackType = 'error' | 'warning' | 'success' | 'info';

export interface Feedback {
  message: ReactNode;
  type: FeedbackType;
}

interface Props {
  message: ReactNode;
  type?: FeedbackType;
}

export default function FormFeedback({ message, type = 'error' }: Props) {
  return (
    <div className={styles.formFeedback} data-type={type}>
      {message}
    </div>
  );
}
