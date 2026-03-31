/**
 * Centralized route definitions.
 * All paths are defined here — change once, update everywhere.
 *
 * Dynamic segments use :param notation (e.g. :deckId).
 * Use `generatePath(ROUTES.SOME_ROUTE, { param: value })` to build URLs.
 */
export const ROUTES = {
  // auth
  LOGIN: '/login',
  REGISTER: '/register',

  // app
  DASHBOARD: '/dashboard',
  LIBRARY: '/library',
  DECK_CARDS: '/library/:deckId/cards',
  DECK_CARDS_NEW: '/library/:deckId/cards/new',
  DECK_CARD_EDIT: '/library/:deckId/cards/:cardId/edit',
  STUDY: '/study',
  STUDY_SESSION: '/study/:deckId',
  STUDY_HISTORY: '/study/history',
  STATS: '/stats',
  SETTINGS: '/settings',
} as const;

type RouteParams = Record<string, string | number>;

/**
 * Replaces :param placeholders in a route pattern with actual values.
 * Optionally appends a query string from `query` object.
 *
 * @example
 * generatePath(ROUTES.DECK_CARDS, { deckId: '123' })
 * // → '/library/123/cards'
 *
 * generatePath(ROUTES.STUDY_SESSION, { deckId: '123' }, { mode: 'review' })
 * // → '/study/123?mode=review'
 */
export function generatePath(
  pattern: string,
  params?: RouteParams,
  query?: Record<string, string | number | undefined>,
): string {
  let path = pattern;

  if (params) {
    path = path.replace(/:([a-zA-Z]+)/g, (_, key) => {
      const value = params[key];
      if (value === undefined)
        throw new Error(`generatePath: missing param "${key}"`);
      return String(value);
    });
  }

  if (query) {
    const qs = Object.entries(query)
      .filter(([, v]) => v !== undefined)
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join('&');
    if (qs) path = `${path}?${qs}`;
  }

  return path;
}
