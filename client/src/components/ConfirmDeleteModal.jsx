import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Modal from "./Modal.jsx";

export default function ConfirmDeleteModal({ open, task, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSubmitting(false);
    setError("");
  }, [open, task?.id]);

  if (!open || !task) return null;

  async function handleConfirm() {
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(task);
    } catch (err) {
      setError(err.message || "Could not delete the task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      onClose={submitting ? () => {} : onClose}
      labelledBy="delete-modal-title"
      initialFocusRef={cancelRef}
      closeOnBackdrop={!submitting}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id="delete-modal-title"
            className="text-lg font-semibold text-slate-900"
          >
            Delete task?
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            This will permanently delete{" "}
            <span className="font-medium text-slate-700">"{task.title}"</span>.
            This action cannot be undone.
          </p>

          {error && (
            <div
              className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          ref={cancelRef}
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="btn-secondary w-full sm:w-auto"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className="btn-danger w-full sm:w-auto"
        >
          <Trash2 size={16} />
          {submitting ? "Deleting…" : "Delete task"}
        </button>
      </div>
    </Modal>
  );
}
