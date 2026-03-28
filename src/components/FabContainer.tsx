import styles from './FabContainer.module.css';

export default function FabContainer({ children }: { children: React.ReactNode }) {
  return <div className={styles.fabContainer}>{children}</div>;
}
