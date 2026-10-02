/** Shared layout for the Play and Build round screens. */

/**
 * Fit the drawing (and its leg captions) on the round stage: no wider than
 * --stage-sign, and no taller than --stage-h given the drawing's --aspect.
 */
export const STAGE_FIT = 'w-[min(100%,var(--stage-sign),calc(var(--stage-h)*var(--aspect,1)))]';

export const ROUND = 'flex min-h-dvh flex-col bg-stage';

/** Stacked on phones; drawing beside the answer dock when the main column is wide. */
export const ROUND_BODY =
  'flex flex-1 flex-col @wide/app:grid @wide/app:grid-cols-[minmax(0,1fr)_26.25rem] @wide/app:items-center @wide/app:gap-8 @wide/app:px-8 @wide/app:pb-8';

/** Sets the --stage-sign and --stage-h limits that STAGE_FIT reads. */
export const ROUND_STAGE =
  'flex flex-1 flex-col items-center justify-center gap-2 px-4 pt-2 pb-4 [--stage-h:40dvh] [--stage-sign:20rem] large:[--stage-sign:24rem] @wide/app:[--stage-h:68dvh] @wide/app:[--stage-sign:32rem]';

/** Bottom sheet on phones, a card beside the drawing when wide. */
export const DOCK =
  'grid gap-3 rounded-t-stage border-t border-card-border bg-surface px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] @wide/app:gap-[0.9rem] @wide/app:rounded-stage @wide/app:border @wide/app:p-7';

export const DOCK_HEADING = 'm-0 font-serif text-[1.4rem] font-semibold @wide/app:text-[1.9rem]';
