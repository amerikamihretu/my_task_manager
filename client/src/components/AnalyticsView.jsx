import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Clock3, TrendingUp } from "lucide-react";

const statusLabels = {
  pending: "Pending",
  "in-progress": "In progress",
  completed: "Completed",
};

const priorityStyles = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

function formatDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function MetricCard({ label, value, detail, icon: Icon, tone }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{detail}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsView({ tasks }) {
  const analytics = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "completed").length;
    const active = tasks.length - completed;
    const overdue = tasks.filter((task) => {
      if (task.status === "completed" || !task.dueDate) return false;
      const date = new Date(task.dueDate);
      return !Number.isNaN(date.getTime()) && date < new Date();
    }).length;
    const priorities = ["high", "medium", "low"].map((priority) => ({
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: tasks.filter((task) => task.priority === priority).length,
      color: priorityStyles[priority],
    }));
    const statuses = ["pending", "in-progress", "completed"].map((status) => ({
      label: statusLabels[status],
      value: tasks.filter((task) => task.status === status).length,
    }));
    const recent = [...tasks]
      .filter((task) => task.completedAt || task.updatedAt || task.createdAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.updatedAt || b.createdAt) -
          new Date(a.completedAt || a.updatedAt || a.createdAt),
      )
      .slice(0, 5);

    return {
      completed,
      active,
      overdue,
      completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      priorities,
      statuses,
      recent,
    };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="card p-8 text-center sm:p-12">
        <TrendingUp className="mx-auto text-brand-600" size={28} />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Your analytics will appear here
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Create a few tasks and complete them to see meaningful progress
          insights.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4" aria-label="Task analytics">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Completion rate"
          value={`${analytics.completionRate}%`}
          detail={`${analytics.completed} completed`}
          icon={TrendingUp}
          tone="brand"
        />
        <MetricCard
          label="Completed"
          value={analytics.completed}
          detail="Tasks finished"
          icon={CheckCircle2}
          tone="emerald"
        />
        <MetricCard
          label="In progress"
          value={analytics.active}
          detail="Tasks remaining"
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          label="Overdue"
          value={analytics.overdue}
          detail="Needs attention"
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-900">Task status</h3>
          <div className="mt-5 space-y-4">
            {analytics.statuses.map((status) => (
              <div key={status.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-slate-500">{status.label}</span>
                  <span className="font-semibold text-slate-700">{status.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
                    style={{ width: `${(status.value / tasks.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-900">Priority mix</h3>
          <div className="mt-5 space-y-4">
            {analytics.priorities.map((priority) => (
              <div key={priority.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className={`h-2 w-2 rounded-full ${priority.color}`} />
                    {priority.label}
                  </span>
                  <span className="font-semibold text-slate-700">{priority.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${priority.color} transition-[width] duration-300`}
                    style={{ width: `${(priority.value / tasks.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
            <p className="mt-1 text-xs text-slate-500">Latest task updates in this workspace</p>
          </div>
          <TrendingUp size={18} className="text-brand-600" />
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {analytics.recent.map((task) => {
            const date = formatDay(task.completedAt || task.updatedAt || task.createdAt);
            return (
              <li key={task.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {statusLabels[task.status] || task.status}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-slate-400">{date || "Unknown date"}</time>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
