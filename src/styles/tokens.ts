const colorDefinitions = {
  blue: "#4285F4",
  white: "#ffffff",
} as const;

export const colors = {
  blue: colorDefinitions.blue,
  white: colorDefinitions.white,
  locationDotFill: colorDefinitions.blue,
  locationDotBorder: colorDefinitions.white,
} as const;

function camelToKebab(str: string) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/** Spread onto the root element's style prop to inject all color tokens as CSS custom properties. */
export function buildColorVars(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(colors).map(([key, value]) => [
      `--color-${camelToKebab(key)}`,
      value,
    ])
  );
}
