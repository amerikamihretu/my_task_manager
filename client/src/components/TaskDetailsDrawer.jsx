import { useEffect, useRef } from "react";
import {
  Archive,
  ArchiveRestore,
  Calendar,
  CheckCircle2,
  Clock3,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

const statusLabels = {
  pending: "Pending",
  "in-progress": "In progress",
  completed: "Completed",
};

const priorityStyles = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-emerald-50 text-emerald-700",
};

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskDetailsDrawer({
  task,
  onClose,
  onToggle,
  onEdit,
  onDelete,
  onToggleSubtask,
  onArchive,
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!task) return undefined;
    const previousActive = document.activeElement;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (previousActive instanceof HTMLElement) previousActive.focus();
    };
  }, [onClose, task]);

  if (!task) return null;

  const completed = task.status === "completed";
  const priority = task.priority || "medium";

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close task details"
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-modal dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Task details
            </p>
            <p className="mt-1 text-xs text-slate-400">Review and manage this task</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close task details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <h2
            id="task-details-title"
            className={`text-2xl font-bold tracking-tight ${
              completed ? "text-slate-400 line-through" : "text-slate-900"
            }`}
          >
            {task.title}
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-500">
            {task.description || "No description added for this task."}
          </p>

          {task.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {task.subtasks?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-800">Checklist</h3>
              <ul className="mt-2 space-y-2">
                {task.subtasks.map((subtask, index) => (
                  <li key={`${subtask.title}-${index}`} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(subtask.completed)}
                      onChange={() => onToggleSubtask(task, index)}
                      className="mt-0.5 h-4 w-4 accent-brand-600"
                      aria-label={`Mark subtask "${subtask.title}" ${
                        subtask.completed ? "incomplete" : "complete"
                      }`}
                    />
                    <span className={`text-sm ${subtask.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {subtask.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {statusLabels[task.status] || task.status}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Priority</p>
              <p className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${priorityStyles[priority] || "bg-slate-100 text-slate-700"}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={12} /> Due date
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDate(task.dueDate)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Clock3 size={12} /> Updated
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDate(task.updatedAt || task.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-2 border-t border-slate-200 p-5 sm:grid-cols-4 dark:border-slate-700">
          <button type="button" onClick={() => onToggle(task)} className="btn-secondary">
            <CheckCircle2 size={16} />
            {completed ? "Reopen" : "Complete"}
          </button>
          <button type="button" onClick={() => onEdit(task)} className="btn-secondary">
            <Pencil size={16} />
            Edit
          </button>
          <button type="button" onClick={() => onArchive(task)} className="btn-secondary">
            {task.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            {task.archived ? "Restore" : "Archive"}
          </button>
          <button type="button" onClick={() => onDelete(task)} className="btn-danger">
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
