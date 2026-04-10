import type React from 'react';

// `anchor-name` and `position-anchor` are not yet in React's CSSProperties type definitions.
// We extend it locally rather than casting to avoid silently losing type safety elsewhere.
export type CSSWithAnchorPositioning = React.CSSProperties & {
  anchorName?: string;
  positionAnchor?: string;
};
