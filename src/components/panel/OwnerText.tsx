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
    <p>
      {currentUserIsOwner
        ? `${objectName} aangemaakt door jou`
        : `${objectName} aangemaakt door andere gebruiker`}
    </p>
  );
}
