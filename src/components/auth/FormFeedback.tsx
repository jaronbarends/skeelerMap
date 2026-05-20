import type { ReactNode } from 'react';

import styles from './FormFeedback.module.css';

export type FeedbackType = 'error' | 'warning' | 'success' | 'info';

export type Feedback =
  | {
      message: string;
      type: FeedbackType;
    }
  | {
      messageNode: ReactNode;
      type: FeedbackType;
    };

export default function FormFeedback(feedback: Feedback) {
  const isAssertive = feedback.type === 'error' || feedback.type === 'warning';

  return (
    <div
      className={styles.formFeedback}
      data-type={feedback.type}
      role={isAssertive ? 'alert' : 'status'}
      aria-live={isAssertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      data-testid="form-feedback"
    >
      {'message' in feedback ? feedback.message : feedback.messageNode}
    </div>
  );
}
