import { ReactNode } from 'react';

import { getIconByName } from '@/lib/getIconByName';

import styles from './FabContainer.module.css';

const Icon = getIconByName('trafficSignSlope');
export default function FabContainer({ children }: { children: ReactNode }) {
  return (
    <div className={styles.fabContainer}>
      <Icon />
      {children}
    </div>
  );
}
