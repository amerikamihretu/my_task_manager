import { ClipboardList, SearchX, Plus, RotateCcw } from "lucide-react";

export default function EmptyState({
  variant = "no-tasks",
  onCreate,
  onClearFilters,
}) {
  const config = {
    "no-tasks": {
      icon: ClipboardList,
      title: "No tasks yet",
      description: "Create your first task and it will show up here.",
    },
    "no-results": {
      icon: SearchX,
      title: "No matching tasks",
      description:
        "Try a different search or clear the filters to see all tasks.",
    },
  }[variant];

  const Icon = config.icon;

  return (
    <div className="card flex flex-col items-center justify-center overflow-hidden px-6 py-14 text-center">
      <div className="relative mb-5 flex h-20 w-28 items-center justify-center">
        <svg
          viewBox="0 0 112 80"
          className="absolute inset-0 h-full w-full text-brand-100"
          aria-hidden="true"
        >
          <path
            d="M20 21.5A9.5 9.5 0 0 1 29.5 12h25l7 7h21A9.5 9.5 0 0 1 92 28.5v27a9.5 9.5 0 0 1-9.5 9.5h-53a9.5 9.5 0 0 1-9.5-9.5v-34Z"
            fill="currentColor"
          />
          <path
            d="M31 38h50M31 49h32"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="4"
            opacity=".9"
          />
        </svg>
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card">
          <Icon size={21} className="text-brand-600" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900">{config.title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {config.description}
      </p>

      {variant === "no-tasks" && onCreate && (
        <button type="button" onClick={onCreate} className="btn-primary mt-6">
          <Plus size={16} />
          Create your first task
        </button>
      )}

      {variant === "no-results" && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="btn-secondary mt-6"
        >
          <RotateCcw size={15} />
          Clear filters
        </button>
      )}
    </div>
  );
}
