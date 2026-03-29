import styles from './PanelInstruction.module.css';

interface Props {
  children: React.ReactNode;
}

export default function PanelInstruction({ children }: Props) {
  return <p className={styles.instruction}>{children}</p>;
}
