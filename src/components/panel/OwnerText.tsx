import styles from './OwnerText.module.css';

interface Props {
  userIsLoggedIn: boolean;
  currentUserIsOwner: boolean;
  objectName: string;
}

export default function OwnerText({ userIsLoggedIn, currentUserIsOwner, objectName }: Props) {
  if (!userIsLoggedIn) {
    return null;
  }
  return (
    <p className={styles.component}>
      {currentUserIsOwner
        ? `${objectName} aangemaakt door jou`
        : `${objectName} aangemaakt door andere gebruiker`}
    </p>
  );
}
