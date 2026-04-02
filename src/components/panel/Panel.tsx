import { useRef, useEffect, type ReactNode } from 'react';

import styles from './Panel.module.css';

interface Props {
  children: ReactNode;
}

export default function Panel({ children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div className={styles.panel} ref={panelRef} tabIndex={-1}>
      {children}
    </div>
  );
}
