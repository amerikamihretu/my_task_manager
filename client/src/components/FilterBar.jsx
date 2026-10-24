import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "createdAt-asc", label: "Oldest first" },
  { value: "dueDate-asc", label: "Due date ↑" },
  { value: "dueDate-desc", label: "Due date ↓" },
];

export default function FilterBar({
  filters,
  onChange,
  onReset,
  resultCount,
  tagOptions = [],
}) {
  const hasActive =
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.tag ||
    filters.sort !== "createdAt-desc";

  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  const activeChips = [
    filters.search && {
      key: "search",
      label: `Search: ${filters.search}`,
      value: "",
    },
    filters.status && {
      key: "status",
      label: STATUS_OPTIONS.find((option) => option.value === filters.status)
        ?.label,
      value: "",
    },
    filters.priority && {
      key: "priority",
      label: PRIORITY_OPTIONS.find(
        (option) => option.value === filters.priority,
      )?.label,
      value: "",
    },
    filters.tag && {
      key: "tag",
      label: `Tag: ${filters.tag}`,
      value: "",
    },
    filters.sort !== "createdAt-desc" && {
      key: "sort",
      label: SORT_OPTIONS.find((option) => option.value === filters.sort)
        ?.label,
      value: "createdAt-desc",
    },
  ].filter(Boolean);

  return (
    <div className="card sticky top-3 z-10 p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Search tasks by title or description…"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="input pl-9"
            aria-label="Search tasks"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <div className="relative col-span-2 sm:col-span-1">
            <SlidersHorizontal
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filters.status}
              onChange={(e) => set("status", e.target.value)}
              className="input w-full appearance-none py-1.5 pl-8 pr-7 text-xs sm:w-auto"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

          </div>

          <select
            value={filters.priority}
            onChange={(e) => set("priority", e.target.value)}
            className="input w-full appearance-none px-2.5 py-1.5 text-xs sm:w-auto"
            aria-label="Filter by priority"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {tagOptions.length > 0 && (
            <select
              value={filters.tag}
              onChange={(e) => set("tag", e.target.value)}
              className="input w-full appearance-none px-2.5 py-1.5 text-xs sm:w-auto"
              aria-label="Filter by tag"
            >
              <option value="">All tags</option>
              {tagOptions.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <ArrowUpDown
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value)}
              className="input w-full appearance-none py-1.5 pl-8 pr-7 text-xs sm:w-auto"
              aria-label="Sort tasks"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {hasActive && (
            <button
              type="button"
              onClick={onReset}
              className="col-span-2 inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:col-span-1"
            >
              <X size={13} />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          {resultCount} {resultCount === 1 ? "task" : "tasks"}
          {hasActive ? " matching" : ""}
        </span>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-xs font-medium text-slate-500">Active filters</span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => set(chip.key, chip.value)}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:border-brand-200 hover:bg-brand-100"
              aria-label={`Clear ${chip.label} filter`}
            >
              <span className="max-w-48 truncate">{chip.label}</span>
              <X size={12} aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
