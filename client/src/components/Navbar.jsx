import { useEffect, useRef, useState } from "react";
import {
  LogOut,
  CheckSquare,
  ChevronDown,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { assetUrl } from "../services/api.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("mytask-theme") === "dark",
  );
  const menuRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("mytask-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function openSettings() {
    setMenuOpen(false);
    navigate("/settings");
  }

  useEffect(() => {
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <CheckSquare size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-900">
              MyTask
            </h1>
            <p className="mt-1 text-xs text-slate-400">Personal task manager</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Open user menu"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {user?.avatar ? (
                <img src={assetUrl(user.avatar)} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-32 truncate text-sm font-semibold text-slate-800">
                {user?.name}
              </span>
              <span className="block max-w-32 truncate text-xs text-slate-400">
                {user?.email}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-modal"
              role="menu"
            >
              <div className="border-b border-slate-100 px-3 py-2 sm:hidden">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode((enabled) => !enabled)}
                className="btn-ghost mt-1 w-full justify-start"
                role="menuitem"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? "Use light mode" : "Use dark mode"}
              </button>
              <button
                type="button"
                onClick={openSettings}
                className="btn-ghost w-full justify-start"
                role="menuitem"
              >
                <Settings size={16} />
                Profile & settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200"
                role="menuitem"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
