/** Shared layout for the Play and Build round screens. */

/**
 * Fit the drawing (and its leg captions) on the round stage: no wider than
 * --stage-sign, and no taller than --stage-h given the drawing's --aspect.
 */
export const STAGE_FIT = 'w-[min(100%,var(--stage-sign),calc(var(--stage-h)*var(--aspect,1)))]';
