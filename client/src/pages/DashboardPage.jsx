import { useEffect, useMemo, useState } from "react";
import { Archive, Plus, ListTodo, CalendarDays, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import Navbar from "../components/Navbar.jsx";
import FilterBar from "../components/FilterBar.jsx";
import TaskCard from "../components/TaskCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TaskFormModal from "../components/TaskFormModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import CalendarView from "../components/CalendarView.jsx";
import TaskDetailsDrawer from "../components/TaskDetailsDrawer.jsx";
import AnalyticsView from "../components/AnalyticsView.jsx";
import AiPlanner from "../components/AiPlanner.jsx";

const defaultFilters = {
  search: "",
  status: "",
  priority: "",
  tag: "",
  sort: "createdAt-desc",
};

function TaskSkeleton() {
  return (
    <div className="card animate-pulse p-4">
      <div className="flex gap-3">
        <div className="h-5 w-5 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function sortTasks(list, sortValue) {
  const [field, dir] = sortValue.split("-");
  return [...list].sort((a, b) => {
    const av = field === "dueDate" ? a.dueDate : a.createdAt;
    const bv = field === "dueDate" ? b.dueDate : b.createdAt;
    if (!av && !bv) return 0;
    if (!av) return 1;
    if (!bv) return -1;
    const diff = new Date(av) - new Date(bv);
    return dir === "asc" ? diff : -diff;
  });
}

function getPlannerGroups(list) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const groups = [
    { id: "overdue", label: "Overdue", tone: "text-red-600", tasks: [] },
    { id: "today", label: "Today", tone: "text-brand-600", tasks: [] },
    { id: "upcoming", label: "Upcoming", tone: "text-slate-700", tasks: [] },
    { id: "unscheduled", label: "No due date", tone: "text-slate-500", tasks: [] },
  ];

  list.forEach((task) => {
    if (!task.dueDate) {
      groups[3].tasks.push(task);
      return;
    }

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < startOfToday && task.status !== "completed") {
      groups[0].tasks.push(task);
    } else if (dueDate < startOfTomorrow) {
      groups[1].tasks.push(task);
    } else {
      groups[2].tasks.push(task);
    }
  });

  return groups.filter((group) => group.tasks.length > 0);
}

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [viewMode, setViewMode] = useState("list");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [detailsTask, setDetailsTask] = useState(null);
  const [toast, setToast] = useState(null);
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);

  function showToast(message, tone = "success") {
    setToast({ message, tone });
  }

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  async function loadTasks() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    } catch (err) {
      if (err.status === 401) {
        await logout();
        return;
      }
      setLoadError(err.message || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTasks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleShortcut(event) {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (event.key.toLowerCase() === "n" && !isTyping && !formOpen) {
        event.preventDefault();
        openCreate();
      }

    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [formOpen]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: tasks.length,
      active: tasks.filter((t) => t.status !== "completed").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter(
        (t) =>
          t.status !== "completed" && t.dueDate && new Date(t.dueDate) < now,
      ).length,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    let list = tasks.filter((task) =>
      viewMode === "archived" ? task.archived : !task.archived,
    );

    const q = filters.search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q),
      );
    }
    if (filters.status) {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      list = list.filter((t) => t.priority === filters.priority);
    }
    if (filters.tag) {
      list = list.filter((t) => t.tags?.includes(filters.tag));
    }

    return sortTasks(list, filters.sort);
  }, [tasks, filters, viewMode]);

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.tag ||
    filters.sort !== defaultFilters.sort,
  );
  const plannerGroups = useMemo(
    () => getPlannerGroups(visibleTasks),
    [visibleTasks],
  );
  const plannerScheduledCount = visibleTasks.filter((task) => task.dueDate).length;
  const tagOptions = useMemo(
    () =>
      [...new Set(tasks.flatMap((task) => task.tags || []))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [tasks],
  );
  const currentDetailsTask = detailsTask
    ? tasks.find((task) => task.id === detailsTask.id) || detailsTask
    : null;

  function openCreate() {
    setFormMode("create");
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task) {
    setFormMode("edit");
    setEditingTask(task);
    setFormOpen(true);
  }

  async function handleSubmit(payload) {
    try {
      if (formMode === "edit" && editingTask) {
        const res = await api.put(`/tasks/${editingTask.id}`, payload);
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? res.data.task : t)),
        );
      } else {
        const res = await api.post("/tasks", payload);
        setTasks((prev) => [res.data.task, ...prev]);
        showToast("Task created");
      }

      if (formMode === "edit") showToast("Task updated");
      setFormOpen(false);
    } catch (err) {
      if (err.status === 401) await logout();
      throw err; // let the modal display it
    }
  }

  async function handleCreateAiTasks(plannedTasks) {
    const created = await Promise.all(
      plannedTasks.map((task) => api.post("/tasks", task)),
    );
    setTasks((prev) => [...created.map((res) => res.data.task), ...prev]);
    showToast(
      `${created.length} AI-planned task${created.length === 1 ? "" : "s"} created`,
    );
  }

  async function handleToggle(task) {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, status: nextStatus } : item,
      ),
    );
    try {
      const res = await api.put(`/tasks/${task.id}`, { status: nextStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? res.data.task : t)),
      );
      showToast(nextStatus === "completed" ? "Task completed" : "Task reopened");
    } catch (err) {
      if (err.status === 401) {
        setTasks(previousTasks);
        await logout();
        return;
      }

      if (err.status === 404) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        setLoadError(
          "This task no longer exists. It may have been deleted elsewhere.",
        );
        return;
      }
      setTasks(previousTasks);
      setLoadError(err.message || "Could not update the task.");
      showToast("Could not update task. Your change was reverted.", "error");
    }
  }

  async function handleArchive(task) {
    const archived = !task.archived;
    try {
      const res = await api.put(`/tasks/${task.id}`, { archived });
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? res.data.task : item)),
      );
      setDetailsTask(null);
      showToast(archived ? "Task archived" : "Task restored");
    } catch (err) {
      if (err.status === 401) await logout();
      else showToast(err.message || "Could not update task archive.", "error");
    }
  }

  async function handleToggleSubtask(task, subtaskIndex) {
    const subtasks = (task.subtasks || []).map((subtask, index) =>
      index === subtaskIndex
        ? { ...subtask, completed: !subtask.completed }
        : subtask,
    );
    try {
      const res = await api.put(`/tasks/${task.id}`, { subtasks });
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? res.data.task : item)),
      );
    } catch (err) {
      if (err.status === 401) await logout();
      else showToast(err.message || "Could not update checklist.", "error");
    }
  }

  async function handleConfirmDelete(task) {
    try {
      await api.delete(`/tasks/${task.id}`);
    } catch (err) {
      if (err.status === 404) {
        // already gone — treat as success
      } else if (err.status === 401) {
        await logout();
        return;
      } else {
        throw err; // modal shows the error and stays open
      }
    }
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setDeletingTask(null);
    showToast("Task deleted");
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (user?.name || "").trim().split(" ")[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {greeting}
              {firstName ? `, ${firstName}` : ""}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {stats.active > 0
                ? `You have ${stats.active} ${
                    stats.active === 1 ? "task" : "tasks"
                  } left to complete.`
                : tasks.length > 0
                  ? "All caught up — nice work."
                  : "Add your first task to get started."}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
                  viewMode === "list"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                aria-pressed={viewMode === "list"}
              >
                <ListTodo size={14} />
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("planner")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
                  viewMode === "planner"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                aria-pressed={viewMode === "planner"}
              >
                <CalendarDays size={14} />
                Planner
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
                  viewMode === "calendar"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                aria-pressed={viewMode === "calendar"}
              >
                <CalendarDays size={14} />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setViewMode("archived")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
                  viewMode === "archived"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                aria-pressed={viewMode === "archived"}
              >
                <Archive size={14} />
                Archived
              </button>
              <button
                type="button"
                onClick={() => setViewMode("analytics")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
                  viewMode === "analytics"
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                aria-pressed={viewMode === "analytics"}
              >
                Analytics
              </button>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary w-full shrink-0 sm:w-auto"
            >
              <Plus size={16} />
              Create task
            </button>
            <button
              type="button"
              onClick={() => setAiPlannerOpen((open) => !open)}
              className="btn-secondary w-full shrink-0 sm:w-auto"
            >
              <Sparkles size={16} />
              Plan with AI
            </button>
          </div>
        </div>

        {aiPlannerOpen && (
          <AiPlanner
            tasks={tasks}
            onCreateTasks={handleCreateAiTasks}
            onClose={() => setAiPlannerOpen(false)}
          />
        )}

        {/* Filters */}
        <div className="mb-4">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
            resultCount={visibleTasks.length}
            tagOptions={tagOptions}
          />
        </div>

        {/* Load error */}
        {loadError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={loadTasks}
              className="shrink-0 rounded border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="space-y-3">
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
          </div>
        ) : viewMode === "calendar" ? (
          <CalendarView
            tasks={visibleTasks}
            onCreateTask={openCreate}
            onEditTask={openEdit}
          />
        ) : viewMode === "analytics" ? (
          <AnalyticsView tasks={visibleTasks} />
        ) : viewMode === "planner" ? (
            <section className="space-y-6" aria-label="Task planner">
              <div className="card overflow-hidden p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Your focus plan
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {plannerScheduledCount} of {visibleTasks.length} visible{" "}
                      {visibleTasks.length === 1 ? "task has" : "tasks have"} a due date.
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 sm:w-40">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
                      style={{
                        width: `${
                          visibleTasks.length
                            ? `${(plannerScheduledCount / visibleTasks.length) * 100}%`
                            : "0%"
                        }`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {plannerGroups.length === 0 ? (
                <EmptyState
                  variant={hasActiveFilters ? "no-results" : "no-tasks"}
                  onClearFilters={() => setFilters(defaultFilters)}
                  onCreate={openCreate}
                />
              ) : (
                plannerGroups.map((group) => (
                  <section key={group.id} aria-labelledby={`planner-${group.id}`}>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <h3
                        id={`planner-${group.id}`}
                        className={`text-sm font-bold ${group.tone}`}
                      >
                        {group.label}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {group.tasks.length}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {group.tasks.map((task) => (
                        <li key={task.id}>
                          <TaskCard
                            task={task}
                            onToggle={handleToggle}
                            onEdit={openEdit}
                            onDelete={setDeletingTask}
                            onDetails={setDetailsTask}
                            onArchive={handleArchive}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </section>
        ) : visibleTasks.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                variant="no-results"
                onClearFilters={() => setFilters(defaultFilters)}
              />
            ) : (
              <EmptyState variant="no-tasks" onCreate={openCreate} />
            )
        ) : (
          <ul className="space-y-3">
            {visibleTasks.map((task) => (
              <li key={task.id}>
                <TaskCard
                  task={task}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={setDeletingTask}
                  onDetails={setDetailsTask}
                  onArchive={handleArchive}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {toast && (
        <div
          className={`fixed right-4 top-20 z-40 rounded-xl border px-4 py-3 text-sm font-medium shadow-modal ${
            toast.tone === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <TaskFormModal
        open={formOpen}
        mode={formMode}
        initialTask={editingTask}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteModal
        open={Boolean(deletingTask)}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      <TaskDetailsDrawer
        task={currentDetailsTask}
        onClose={() => setDetailsTask(null)}
        onToggle={handleToggle}
        onEdit={(task) => {
          setDetailsTask(null);
          openEdit(task);
        }}
        onDelete={(task) => {
          setDetailsTask(null);
          setDeletingTask(task);
        }}
        onToggleSubtask={handleToggleSubtask}
        onArchive={handleArchive}
      />
    </div>
  );
}
