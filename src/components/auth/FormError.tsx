import type { ReactNode } from 'react';

import styles from './FormError.module.css';

interface Props {
  message: ReactNode;
}

export default function FormError({ message }: Props) {
  return <div className={styles.formError}>{message}</div>;
}
