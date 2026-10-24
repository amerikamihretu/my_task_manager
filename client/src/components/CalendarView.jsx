import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function taskDateKey(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateKey(date);
}

function getCalendarDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const firstGridDay = new Date(firstDay);
  firstGridDay.setDate(firstGridDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstGridDay);
    day.setDate(firstGridDay.getDate() + index);
    return day;
  });
}

const priorityDot = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

export default function CalendarView({ tasks, onCreateTask, onEditTask }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const days = useMemo(() => getCalendarDays(month), [month]);
  const tasksByDate = useMemo(() => {
    const grouped = new Map();
    tasks.forEach((task) => {
      const key = taskDateKey(task.dueDate);
      if (!key) return;
      const current = grouped.get(key) || [];
      grouped.set(key, [...current, task]);
    });
    return grouped;
  }, [tasks]);

  function shiftMonth(offset) {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function goToToday() {
    const today = new Date();
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  const monthLabel = month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const todayKey = dateKey(new Date());

  return (
    <section className="card overflow-hidden" aria-label="Task calendar">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-sm font-semibold text-slate-900">{monthLabel}</p>
          <p className="mt-1 text-xs text-slate-500">
            {tasksByDate.size} day{tasksByDate.size === 1 ? "" : "s"} with
            scheduled tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            Today
          </button>
          <div className="flex rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-l-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-r-lg border-l border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:px-3"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = dateKey(day);
          const dayTasks = tasksByDate.get(key) || [];
          const isCurrentMonth = day.getMonth() === month.getMonth();
          const isToday = key === todayKey;

          return (
            <div
              key={key}
              className={`min-h-24 border-b border-r border-slate-200 p-1.5 last:border-r-0 sm:min-h-32 sm:p-2 ${
                isCurrentMonth ? "bg-white" : "bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    isToday
                      ? "bg-brand-600 text-white"
                      : isCurrentMonth
                        ? "text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {day.getDate()}
                </span>
                {isCurrentMonth && (
                  <button
                    type="button"
                    onClick={() => onCreateTask(day)}
                    className="rounded p-1 text-slate-300 transition-colors hover:bg-brand-50 hover:text-brand-600"
                    aria-label={`Create task for ${day.toLocaleDateString()}`}
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>

              <div className="mt-1 space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onEditTask(task)}
                    className={`flex w-full items-center gap-1 truncate rounded px-1.5 py-1 text-left text-[11px] transition-colors hover:bg-brand-50 ${
                      task.status === "completed"
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }`}
                    title={task.title}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        priorityDot[task.priority] || "bg-slate-400"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{task.title}</span>
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <p className="px-1.5 text-[11px] font-medium text-brand-600">
                    +{dayTasks.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.every((task) => !task.dueDate) && (
        <div className="border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500">
          No tasks have due dates yet. Use the plus button on a day to schedule
          one.
        </div>
      )}
    </section>
  );
}
