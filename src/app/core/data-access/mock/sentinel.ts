/**
 * Marker carried by every mock adapter. `scripts/check-bundle-no-mock.mjs` fails the build if it appears in the
 * production bundle (frontend.md §6.2).
 */
export const ATLAS_MOCK_SENTINEL = 'ATLAS_MOCK_SENTINEL::dev-only-sample-data';
