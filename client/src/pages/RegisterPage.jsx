import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  Check,
  CheckSquare,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { user, register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const passwordLength = password.length;
  const passwordValid = passwordLength >= 8 && passwordLength <= 72;
  const passwordTooLong = passwordLength > 72;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
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
              Start with intention
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight">
              Turn plans
              <br />
              into progress.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-brand-100">
              A focused task manager for the work that matters today, tomorrow,
              and every day after.
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-sm text-brand-100">
          <ShieldCheck size={17} />
          Your session stays private and protected
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
                <p className="text-xs text-brand-100">Start with intention</p>
              </div>
            </div>
            <ShieldCheck size={19} className="text-brand-100" />
          </div>
        </div>

        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10 sm:px-6 lg:min-h-0 lg:w-full lg:py-0">
        <div className="w-full max-w-md">
          <div className="mb-7">
            <p className="text-sm font-semibold text-brand-600">Get started</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Create your workspace
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Set up your account and make your next step easier to see.
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
            <label htmlFor="name" className="label">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
                minLength={8}
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
            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
              <p
                className={
                  passwordTooLong
                    ? "text-red-600"
                    : passwordValid
                      ? "text-emerald-600"
                      : "text-slate-400"
                }
              >
                {passwordTooLong
                  ? "Password must be 72 characters or fewer"
                  : passwordValid
                    ? "Password length looks good"
                    : "Use between 8 and 72 characters"}
              </p>
              {passwordValid && <Check size={14} aria-label="Valid password length" />}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            <UserPlus size={16} />
            {submitting ? "Creating account…" : "Create account"}
          </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
          </p>
        </div>
        </div>
      </main>
    </div>
  );
}
