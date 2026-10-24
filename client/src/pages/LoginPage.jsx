import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { CheckSquare, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
      <aside className="relative hidden overflow-hidden bg-brand-700 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/40" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-950/30" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <CheckSquare size={21} />
            </div>
            <span className="text-xl font-bold tracking-tight">MyTask</span>
          </div>
          <div className="mt-24 max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100">
              Make room for momentum
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight">
              One clear list.
              <br />
              More done.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-brand-100">
              Keep priorities visible, turn intentions into action, and enjoy
              the calm that comes with a focused workspace.
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-brand-100">
          <ShieldCheck size={17} />
          Secure session protected by an HttpOnly cookie
        </div>
      </aside>

      <main className="min-h-screen lg:flex lg:items-center lg:justify-center">
        <div className="bg-brand-700 px-4 py-5 text-white sm:px-6 lg:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <CheckSquare size={21} />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">MyTask</p>
                <p className="text-xs text-brand-100">Make room for momentum</p>
              </div>
            </div>
            <ShieldCheck size={19} className="text-brand-100" />
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 sm:px-6 lg:min-h-0 lg:w-full lg:py-0">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <p className="text-sm font-semibold text-brand-600">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your workspace
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Pick up where you left off and keep your momentum going.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 shadow-card-hover sm:p-8">
          {error && (
            <div
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            <LogIn size={16} />
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
          No account?{" "}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Create one
          </Link>
          </p>
        </div>
        </div>
      </main>
    </div>
  );
}
