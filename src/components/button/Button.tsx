import clsx from 'clsx';
import Link from 'next/link';
import { type RefObject } from 'react';

import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'danger' | 'secondary' | 'ghost';

interface ButtonProps {
  onClick?: () => void;
  href?: string;
  label: string;
  variant: ButtonVariant;
  disabled?: boolean;
  ref?: RefObject<HTMLButtonElement | null>;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  onClick,
  href,
  label,
  variant,
  disabled,
  ref,
  type = 'button',
}: ButtonProps) {
  if (href) {
    return (
      <Link className={clsx(styles.component, styles[variant])} href={href}>
        {label}
      </Link>
    );
  }
  return (
    <button
      className={clsx(styles.component, styles[variant])}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
      type={type}
    >
      {label}
    </button>
  );
}
