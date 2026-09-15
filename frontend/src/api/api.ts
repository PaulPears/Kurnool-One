/**
 * Firebase Storage URLs are always absolute.
 * This helper is kept for backwards compatibility with components
 * that call getMediaUrl() – it now just returns the URL as-is.
 */
export const getMediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  return path;
};
