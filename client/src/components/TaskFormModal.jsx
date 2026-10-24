import { useEffect, useRef, useState } from "react";
import { X, Plus, Save } from "lucide-react";
import Modal from "./Modal.jsx";

const emptyForm = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  dueDate: "",
  tags: "",
  subtasks: "",
};

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDateInputValue(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeField(field) {
  return String(field).replace(/^body\./, "");
}

export default function TaskFormModal({
  open,
  mode = "create",
  initialTask,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "pending",
        priority: initialTask.priority || "medium",
        dueDate: toDateInputValue(initialTask.dueDate),
        tags: (initialTask.tags || []).join(", "),
        subtasks: (initialTask.subtasks || [])
          .map((subtask) => `${subtask.completed ? "[x] " : ""}${subtask.title}`)
          .join("\n"),
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
    setFormError("");
    setSubmitting(false);
  }, [open, mode, initialTask?.id]);

  if (!open) return null;

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    else if (form.title.trim().length > 200)
      errs.title = "Title cannot exceed 200 characters";
    if (form.description.length > 2000)
      errs.description = "Description cannot exceed 2000 characters";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    const subtaskLines = form.subtasks.split("\n");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: fromDateInputValue(form.dueDate),
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .filter((tag, index, list) => list.indexOf(tag) === index),
      subtasks: subtaskLines
        .map((line) => {
          const trimmed = line.trim();
          return {
            title: trimmed.replace(/^\[x\]\s*/i, "").trim(),
            completed: /^\[x\]\s*/i.test(trimmed),
          };
        })
        .filter((subtask) => subtask.title),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      if (Array.isArray(err.errors) && err.errors.length > 0) {
        const mapped = {};
        for (const issue of err.errors) {
          mapped[normalizeField(issue.field)] = issue.message;
        }
        setErrors(mapped);
      } else {
        setFormError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = mode === "edit";

  return (
    <Modal
      onClose={submitting ? () => {} : onClose}
      labelledBy="task-modal-title"
      initialFocusRef={titleRef}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2
            id="task-modal-title"
            className="text-lg font-semibold text-slate-900"
          >
            {isEdit ? "Edit task" : "New task"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? "Update the details below and save your changes."
              : "Add a task to keep your work organised."}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="btn-ghost -mr-2 -mt-1 p-1.5"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {formError && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="task-title" className="label">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            ref={titleRef}
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="input"
            placeholder="What needs to be done?"
            maxLength={200}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "task-title-error" : undefined}
          />
          {errors.title && (
            <p id="task-title-error" className="mt-1 text-xs text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="task-description" className="label">
            Description
          </label>
          <textarea
            id="task-description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="input min-h-[80px] resize-y"
            placeholder="Optional details…"
            maxLength={2000}
            rows={3}
            aria-invalid={Boolean(errors.description)}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="task-tags" className="label">
            Tags
          </label>
          <input
            id="task-tags"
            type="text"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            className="input"
            placeholder="work, study, personal"
            aria-describedby="task-tags-help"
          />
          <p id="task-tags-help" className="mt-1 text-xs text-slate-400">
            Separate tags with commas. Up to 10 tags.
          </p>
        </div>

        <div>
          <label htmlFor="task-subtasks" className="label">
            Subtasks
          </label>
          <textarea
            id="task-subtasks"
            value={form.subtasks}
            onChange={(e) => set("subtasks", e.target.value)}
            className="input min-h-[80px] resize-y"
            placeholder={"One checklist item per line\n[x] marks an item complete"}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="task-status" className="label">
              Status
            </label>
            <select
              id="task-status"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="input"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-priority" className="label">
              Priority
            </label>
            <select
              id="task-priority"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="task-duedate" className="label">
            Due date
          </label>
          <input
            id="task-duedate"
            type="date"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="task-tags" className="label">
            Tags
          </label>
          <input
            id="task-tags"
            type="text"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            className="input"
            placeholder="work, study, personal"
            aria-describedby="task-tags-help"
          />
          <p id="task-tags-help" className="mt-1 text-xs text-slate-400">
            Separate tags with commas. Up to 10 tags.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-secondary w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto"
          >
            {isEdit ? <Save size={16} /> : <Plus size={16} />}
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
