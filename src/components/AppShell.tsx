'use client';

import MenuBar from '@/components/MenuBar';
import styles from './AppShell.module.css';

export default function AppShell({
  children,
  mapAreaRef,
}: {
  children: React.ReactNode;
  mapAreaRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className={styles.appShell}>
      <MenuBar />
      <div className={styles.mapArea} ref={mapAreaRef}>
        {children}
      </div>
    </div>
  );
}
