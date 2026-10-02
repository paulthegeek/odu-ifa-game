/**
 * Modal sheet (native <dialog>): slides up from the bottom on phones, centered
 * on wide screens. Children stay mounted while closed; a closed dialog is
 * hidden from everyone, so this costs nothing in the accessibility tree.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';

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
      className="sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <div className="sheet-body">
        <div className="sheet-grip" aria-hidden="true" />
        <h2 id={titleId} className="sheet-title">
          {title}
        </h2>
        {children}
        <button type="button" className="btn btn-primary btn-block" onClick={() => ref.current?.close()}>
          Done
        </button>
      </div>
    </dialog>
  );
}
