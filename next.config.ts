import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(isWebpackRuleWithSvgTest);

    if (!fileLoaderRule) {
      return config;
    }

    const issuer = fileLoaderRule.issuer;

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        ...(issuer !== undefined ? { issuer } : {}),
        resourceQuery: { not: /url/ },
        use: ['@svgr/webpack'],
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

// Locates Next's built-in SVG/file rule so we can exclude plain imports from it and route them to SVGR instead.
function isWebpackRuleWithSvgTest(rule: unknown): rule is Record<string, unknown> {
  if (typeof rule !== 'object' || rule === null || !('test' in rule)) {
    return false;
  }
  const test = (rule as { test?: unknown }).test;
  if (test instanceof RegExp) {
    return test.test('.svg');
  }
  if (typeof test === 'object' && test !== null && typeof (test as { test?: unknown }).test === 'function') {
    return (test as { test: (s: string) => boolean }).test('.svg');
  }
  return false;
}

export default nextConfig;
