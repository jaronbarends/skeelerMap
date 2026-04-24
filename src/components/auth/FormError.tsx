import styles from './FormError.module.css';

interface Props {
  message: string;
}

export default function FormError({ message }: Props) {
  return <div className={styles.formError}>{message}</div>;
}
