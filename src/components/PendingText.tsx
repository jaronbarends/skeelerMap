import styles from './PendingText.module.css';

export default function PendingText({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.pendingText}>
      <span className={styles.spinner} />
      {children}
    </div>
  );
}
