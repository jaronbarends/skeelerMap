import { useRef, useEffect, type ReactNode } from 'react';

import styles from './Panel.module.css';

interface Props {
  children: ReactNode;
  testId?: string;
}

export default function Panel({ children, testId }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div className={styles.panel} ref={panelRef} tabIndex={-1} data-testid={testId}>
      {children}
    </div>
  );
}
