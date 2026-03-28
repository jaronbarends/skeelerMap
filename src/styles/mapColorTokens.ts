// tokens.ts

// Palette
const blue = '#4285f4';
const white = '#ffffff';

// Rating palette
const red = '#ff3b3b';
const orange = '#ff8c00';
const yellow = '#f5d800';
const lightgreen = '#a3e635';
const green = '#22c55e';
const turquoise = '#7efff5';

// Semantic rating colors
export const ratingColors = {
  1: red,
  2: orange,
  3: yellow,
  4: lightgreen,
  5: green,
  unknown: turquoise,
} as const;

// Location dot
export const locationDotColors = {
  fill: blue,
  border: white,
} as const;

export const mapColors = {
  rating: ratingColors,
  locationDot: locationDotColors,
} as const;

// CSS custom properties for injection into :root
export const mapColorCSSVars = {
  '--color-rating-1': ratingColors[1],
  '--color-rating-2': ratingColors[2],
  '--color-rating-3': ratingColors[3],
  '--color-rating-4': ratingColors[4],
  '--color-rating-5': ratingColors[5],
  '--color-rating-unknown': ratingColors.unknown,
} as const;
