import styles from './Panel.module.css';

interface Props {
  children: React.ReactNode;
}

export default function Panel({ children }: Props) {
  return <div className={styles.panel}>{children}</div>;
}
