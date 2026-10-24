import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  LockKeyhole,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { assetUrl } from "../services/api.js";

export default function SettingsPage() {
  const { user, updateProfile, removeAvatar, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const selectedAvatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : ""),
    [avatarFile],
  );

  useEffect(
    () => () => {
      if (selectedAvatarPreview) URL.revokeObjectURL(selectedAvatarPreview);
    },
    [selectedAvatarPreview],
  );

  const avatarPreview = selectedAvatarPreview || assetUrl(user?.avatar);

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Avatar must be a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be 2 MB or smaller.");
      return;
    }
    setError("");
    setAvatarFile(file);
  }

  async function handleRemoveAvatar() {
    setError("");
    setProfileMessage("");
    setSavingProfile(true);
    try {
      await removeAvatar();
      setAvatarFile(null);
      setProfileMessage("Avatar removed.");
    } catch (err) {
      setError(err.message || "Could not remove your avatar.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setError("");
    setProfileMessage("");
    setSavingProfile(true);
    try {
      await updateProfile(name.trim(), avatarFile);
      setAvatarFile(null);
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setError("");
    setPasswordMessage("");
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password changed successfully.");
    } catch (err) {
      setError(err.message || "Could not change your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          to="/dashboard"
          className="btn-ghost -ml-3 mb-6"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold text-brand-600">Account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Profile & settings
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep your account details current and your workspace secure.
          </p>
        </div>

        {error && (
          <div
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="space-y-5">
          <section className="card p-5 sm:p-6">
            <div className="flex items-start gap-3">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-700">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound size={24} />
                )}
              </div>
              <label
                htmlFor="settings-avatar"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm"
                title="Choose avatar"
              >
                <Camera size={14} />
                <span className="sr-only">Choose avatar</span>
              </label>
              <input
                id="settings-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Profile details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a JPEG, PNG, or WebP avatar up to 2 MB.
                </p>
              </div>
              {(user?.avatar || avatarFile) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={savingProfile}
                  className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 size={16} />
                  Remove avatar
                </button>
              )}
            </div>
            <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="settings-name" className="label">
                  Full name
                </label>
                <input
                  id="settings-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="input"
                  maxLength={80}
                  required
                />
              </div>
              <div>
                <label htmlFor="settings-email" className="label">
                  Email
                </label>
                <input
                  id="settings-email"
                  value={user?.email || ""}
                  className="input bg-slate-50"
                  readOnly
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                {profileMessage && (
                  <p className="flex items-center gap-1 text-sm text-emerald-600" role="status">
                    <Check size={15} />
                    {profileMessage}
                  </p>
                )}
                <button type="submit" disabled={savingProfile} className="btn-primary ml-auto">
                  <Save size={16} />
                  {savingProfile ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </section>

          <section className="card p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <LockKeyhole size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Change password
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Use at least 8 characters. Your session remains active.
                </p>
              </div>
            </div>
            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="current-password" className="label">
                  Current password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="input"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-password" className="label">
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="input"
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                {passwordMessage && (
                  <p className="flex items-center gap-1 text-sm text-emerald-600" role="status">
                    <Check size={15} />
                    {passwordMessage}
                  </p>
                )}
                <button type="submit" disabled={savingPassword} className="btn-primary ml-auto">
                  <LockKeyhole size={16} />
                  {savingPassword ? "Updating..." : "Change password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
