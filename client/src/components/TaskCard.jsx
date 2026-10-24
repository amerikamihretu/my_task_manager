import {
  Calendar,
  Pencil,
  Trash2,
  Info,
  CheckCircle2,
  Circle,
  Archive,
  ArchiveRestore,
} from "lucide-react";

const priorityStyles = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityLabels = { high: "High", medium: "Medium", low: "Low" };
const priorityDots = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

const statusLabels = {
  pending: "Pending",
  "in-progress": "In progress",
  completed: "Completed",
};

function formatDate(value) {
  if (!value || value === 0 || value === "0") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(value, completed) {
  if (!value || completed) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date < new Date();
}

function formatRelativeTime(value) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return null;

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  for (const [unit, duration] of units) {
    if (Math.abs(seconds) >= duration) {
      return formatter.format(Math.round(seconds / duration), unit);
    }
  }

  return "just now";
}

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onDetails,
  onArchive,
}) {
  const completed = task.status === "completed";
  const due = formatDate(task.dueDate);
  const overdue = isOverdue(task.dueDate, completed);
  const updated = formatRelativeTime(task.updatedAt || task.createdAt);
  const subtaskCount = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.completed).length || 0;

  return (
    <article
      className={`card group flex gap-3 border-l-4 p-4 transition-[box-shadow,border-color,background-color] duration-150 hover:shadow-card-hover ${
        completed
          ? "border-l-emerald-400 bg-slate-50/70"
          : "border-l-brand-500"
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(task)}
        className="mt-0.5 shrink-0 rounded p-0.5 text-slate-400 transition-colors hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        aria-label={
          completed
            ? `Mark "${task.title}" as pending`
            : `Mark "${task.title}" as completed`
        }
      >
        {completed ? (
          <CheckCircle2 size={20} className="text-emerald-600" />
        ) : (
          <Circle size={20} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`truncate text-sm font-semibold transition-colors ${
              completed ? "text-slate-400 line-through" : "text-slate-900"
            }`}
          >
            {task.title}
          </h3>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onDetails(task)}
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label={`View details for "${task.title}"`}
            >
              <Info size={15} />
            </button>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label={`Edit "${task.title}"`}
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onArchive(task)}
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label={task.archived ? `Restore "${task.title}"` : `Archive "${task.title}"`}
            >
              {task.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete "${task.title}"`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {task.description}
          </p>
        )}

        {task.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {subtaskCount > 0 && (
          <button
            type="button"
            onClick={() => onDetails(task)}
            className="mt-2 text-xs font-medium text-slate-500 hover:text-brand-600"
          >
            Checklist {completedSubtasks}/{subtaskCount} complete
          </button>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
              priorityStyles[task.priority] ||
              "bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                priorityDots[task.priority] || "bg-slate-400"
              }`}
              aria-hidden="true"
            />
            {priorityLabels[task.priority] || task.priority}
          </span>

          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
              completed
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {statusLabels[task.status] || task.status}
          </span>

          {due && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                overdue ? "font-medium text-red-600" : "text-slate-400"
              }`}
            >
              <Calendar size={11} />
              {overdue ? "Overdue · " : "Due "}
              {due}
            </span>
          )}

          {updated && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Updated {updated}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
