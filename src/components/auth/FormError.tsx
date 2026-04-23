interface Props {
  message: string;
}

export default function FormError({ message }: Props) {
  return <div className="formError">{message}</div>;
}
