import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Accessible modal shell.
 * Handles: portal rendering, focus trap, Escape to close, body scroll lock,
 * focus restoration on unmount, and optional backdrop-close.
 */
export default function Modal({
  onClose,
  children,
  labelledBy,
  initialFocusRef,
  closeOnBackdrop = false,
}) {
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keep the latest onClose without retriggering the main effect.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousActive = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const container = containerRef.current;
    if (container) {
      const target =
        initialFocusRef?.current ||
        container.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
      target?.focus();
    }

    function handleKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !container) return;

      const focusables = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousActive instanceof HTMLElement) previousActive.focus();
    };
  }, [initialFocusRef]);

  function handleBackdropMouseDown(e) {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-3 pt-6 backdrop-blur-sm sm:p-4 sm:pt-[10vh]"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="card my-auto max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto p-4 shadow-modal sm:max-h-[80vh] sm:p-6"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}