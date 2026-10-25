import { useState } from "react";
import { Check, Loader2, Send, Sparkles, X } from "lucide-react";
import { api } from "../services/api.js";

export default function AiPlanner({ tasks, onCreateTasks, onClose }) {
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handlePlan(event) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const res = await api.post("/ai/plan", {
        prompt: prompt.trim(),
        tasks: tasks.slice(0, 100).map((task) => ({
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          tags: task.tags,
        })),
      });
      setPlan(res.data);
    } catch (err) {
      setError(err.message || "Could not create an AI plan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!plan?.tasks?.length) return;
    setSaving(true);
    setError("");
    try {
      await onCreateTasks(plan.tasks);
      onClose();
    } catch (err) {
      setError(err.message || "Could not create the suggested tasks.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card mb-6 overflow-hidden border-brand-200">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-brand-50/60 p-4">
        <div className="flex gap-3">
          <div className="rounded-lg bg-brand-600 p-2 text-white"><Sparkles size={18} /></div>
          <div>
            <h2 className="font-semibold text-slate-900">Plan with Gemini</h2>
            <p className="mt-1 text-sm text-slate-500">Describe a goal and review the tasks before adding them.</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="btn-ghost p-1.5" aria-label="Close AI planner"><X size={18} /></button>
      </div>

      <form onSubmit={handlePlan} className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="input min-h-20 resize-y"
            placeholder="For example: Plan my launch of a personal portfolio website next month."
            maxLength={2000}
            aria-label="Describe what you want to plan"
          />
          <button type="submit" disabled={loading || !prompt.trim()} className="btn-primary self-end sm:self-start">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? "Planning..." : "Plan"}
          </button>
        </div>
      </form>

      {error && <p className="mx-4 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

      {plan && (
        <div className="border-t border-slate-100 p-4">
          <p className="mb-3 text-sm text-slate-600">{plan.message}</p>
          <ul className="space-y-2">
            {plan.tasks.map((task) => (
              <li key={`${task.title}-${task.dueDate || ""}`} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{task.title}</p>
                    {task.description && <p className="mt-1 text-sm text-slate-500">{task.description}</p>}
                    {task.subtasks?.length > 0 && <p className="mt-2 text-xs text-slate-400">{task.subtasks.length} suggested subtask{task.subtasks.length === 1 ? "" : "s"}</p>}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600">{task.priority}</span>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" onClick={handleCreate} disabled={saving} className="btn-primary mt-4 w-full sm:w-auto">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? "Adding tasks..." : `Add ${plan.tasks.length} task${plan.tasks.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </section>
  );
}
