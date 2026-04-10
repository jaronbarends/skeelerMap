import { useId } from 'react';

import { getIconByName } from '@/lib/getIconByName';

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
  iconName: string;
  tooltip?: string;
}) {
  const rawId = useId();
  // useId returns values like ":r0:" — colons are invalid in CSS <dashed-ident>, so we strip them.
  const anchorId = `--fab-${rawId.replace(/[^a-zA-Z0-9-]/g, '')}`;

  const Icon = getIconByName(iconName);

  return (
    <>
      <button
        className={styles.component}
        aria-label={ariaLabel}
        // Pass anchor name as a CSS custom property; the CSS uses var(--fab-anchor) for both
        // anchor-name (on the button) and position-anchor (on the tooltip), sidestepping the
        // fact that those properties aren't yet in React's CSSProperties type.
        style={{ '--fab-anchor': anchorId } as React.CSSProperties}
        {...{ onClick, disabled }}
      >
        {/* Next.js's built-in compiler throws an error ("Cannot create components during render") if you use <Icon /> here, so we use {Icon({})} instead. */}
        {Icon({})}
      </button>
      {tooltip && (
        <span className={styles.tooltip} aria-hidden="true">
          {tooltip}
        </span>
      )}
    </>
  );
}
