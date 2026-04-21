import { useId } from 'react';
import type { CSSProperties } from 'react';

import { getIconByName, type IconName } from '@/lib/getIconByName';

import styles from './FabButton.module.css';

export default function FabButton({
  onClick,
  ariaLabel,
  disabled,
  iconName,
  tooltip,
}: {
  onClick: () => void;
  ariaLabel: string;
  disabled: boolean;
  iconName: IconName;
  tooltip?: string;
}) {
  const Icon = getIconByName(iconName);

  const rawId = useId();
  // useId returns values like ":r0:" — colons are invalid in CSS <dashed-ident>, so we strip them.
  const anchorId = `--fab-${rawId.replace(/[^a-zA-Z0-9-]/g, '')}`;

  return (
    <>
      <button
        className={styles.button}
        aria-label={ariaLabel}
        style={{ anchorName: anchorId } as CSSProperties}
        {...{ onClick, disabled }}
      >
        {/* Next.js's built-in compiler throws an error ("Cannot create components during render") if you use <Icon /> here, so we use {Icon({})} instead. */}
        {Icon({})}
      </button>
      {tooltip && (
        <span
          className={styles.tooltip}
          aria-hidden="true"
          style={{ positionAnchor: anchorId } as CSSProperties}
        >
          {tooltip}
        </span>
      )}
    </>
  );
}
