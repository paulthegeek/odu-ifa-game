/**
 * Modal sheet (native <dialog>): slides up from the bottom on phones, centered
 * on wide screens. Children stay mounted while closed; a closed dialog is
 * hidden from everyone, so this costs nothing in the accessibility tree.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { button } from './ui';

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || typeof dialog.showModal !== 'function') return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] overflow-auto rounded-stage border border-card-border bg-surface p-0 text-fg backdrop:bg-black/50 motion-safe:open:animate-sheet-up max-md:mx-0 max-md:mt-auto max-md:mb-0 max-md:max-h-[90dvh] max-md:w-full max-md:max-w-full max-md:rounded-b-none"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <div className="grid gap-5 px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
        <div className="h-[4px] w-[40px] justify-self-center rounded-[2px] bg-line" aria-hidden="true" />
        <h2 id={titleId} className="m-0 font-serif text-[1.5rem]">
          {title}
        </h2>
        {children}
        <button
          type="button"
          className={button({ variant: 'primary', block: true })}
          onClick={() => ref.current?.close()}
        >
          Done
        </button>
      </div>
    </dialog>
  );
}
