import type { ReactNode } from 'react';

import styles from './FormFeedback.module.css';

type FeedbackType = 'error' | 'warning' | 'success' | 'info';

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
