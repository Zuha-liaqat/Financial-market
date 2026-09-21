import { useEffect, useRef, useState } from "react";
import {
  apiChangePassword,
  apiGetProfile,
  apiUpdateProfile,
  apiUploadProfilePhoto,
} from "../../lib/api";
import { ErrorToast, SuccessToast } from "../../components/Toast";

function EyeButton({ show, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={show ? "Hide password" : "Show password"}
      className="shrink-0 text-neutral-400 hover:text-black"
    >
      {show ? (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      )}
    </button>
  );
}

function PasswordField({
  id,
  label,
  required,
  placeholder,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  hint,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500"
      >
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
        <EyeButton show={show} onClick={onToggleShow} />
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    apiGetProfile()
      .then((profile) => {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setEmail(profile.email || "");
        setAvatarUrl(profile.avatar_url || null);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const fullName = `${firstName} ${lastName}`.trim();
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const previousAvatar = avatarUrl;
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    setUploadingAvatar(true);
    setAvatarError("");

    try {
      const profile = await apiUploadProfilePhoto(file);
      // Bust the browser's image cache: many backends reuse the same avatar_url per
      // user, so without a cache-busting query param the <img> would keep showing
      // the old cached photo even though the underlying file just changed.
      const freshAvatarUrl = profile.avatar_url
        ? `${profile.avatar_url}?t=${Date.now()}`
        : previewUrl;
      setAvatarUrl(freshAvatarUrl);
      window.dispatchEvent(
        new CustomEvent("user-profile-updated", {
          detail: { avatar_url: freshAvatarUrl },
        }),
      );
    } catch (err) {
      setAvatarUrl(previousAvatar);
      setAvatarError(err.message);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploadingAvatar(false);
    }
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaved(false);
    setProfileError("");
    try {
      const profile = await apiUpdateProfile({
        first_name: firstName,
        last_name: lastName,
      });
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);
    try {
      await apiChangePassword({
        old_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Profile summary */}
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        {profileLoading ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-full bg-neutral-200" />
            <div className="min-w-0 space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-44 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ) : (
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className={`h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-sm ${uploadingAvatar ? "opacity-50" : ""}`}
              />
            ) : (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 text-xl font-semibold text-white ring-2 ring-white shadow-sm ${uploadingAvatar ? "opacity-50" : ""}`}
              >
                {initials || "A"}
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-6 w-6 animate-spin text-brand-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Change profile photo"
              className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-sky-400 via-blue-500 to-violet-600 p-0.5 shadow-md ring-2 ring-white transition hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient
                      id="camera-icon-gradient"
                      x1="1"
                      y1="4"
                      x2="23"
                      y2="21"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                  <path
                    stroke="url(#camera-icon-gradient)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
                  />
                  <circle
                    cx="12"
                    cy="13"
                    r="4"
                    stroke="url(#camera-icon-gradient)"
                    strokeWidth={2}
                  />
                </svg>
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-black sm:text-xl">
              {fullName || "Your Name"}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              {email}
            </p>
          </div>
        </div>
        )}
        {avatarError && (
          <p className="mt-3 text-xs font-medium text-red-600">{avatarError}</p>
        )}
      </div>

      {/* Personal Information */}
      <form
        onSubmit={handleProfileSubmit}
        className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-brand-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="text-xs font-semibold tracking-widest text-neutral-500">
            PERSONAL INFORMATION
          </h3>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500"
            >
              FIRST NAME <span className="text-brand-500">*</span>
            </label>
            {profileLoading ? (
              <div className="h-10.5 w-full animate-pulse rounded-lg bg-neutral-200" />
            ) : (
              <input
                id="firstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setProfileSaved(false);
                }}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
              />
            )}
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500"
            >
              LAST NAME <span className="text-brand-500">*</span>
            </label>
            {profileLoading ? (
              <div className="h-10.5 w-full animate-pulse rounded-lg bg-neutral-200" />
            ) : (
              <input
                id="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setProfileSaved(false);
                }}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
              />
            )}
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-semibold tracking-wide text-neutral-500"
          >
            EMAIL
          </label>
          {profileLoading ? (
            <div className="h-10.5 w-full animate-pulse rounded-lg bg-neutral-200" />
          ) : (
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2.5 text-sm text-neutral-500 outline-none"
            />
          )}
          <p className="mt-1.5 text-[11px] text-neutral-400">
            Contact an administrator to change your email address.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4 border-t border-neutral-100 pt-4">
          <button
            type="submit"
            disabled={savingProfile}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-brand-600 hover:shadow-md disabled:opacity-60"
          >
            {savingProfile && (
              <svg
                className="h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {savingProfile ? "SAVING…" : "SAVE CHANGES"}
          </button>
        </div>
      </form>

      {profileSaved && (
        <SuccessToast
          message="Profile updated successfully!"
          onClose={() => setProfileSaved(false)}
        />
      )}
      {profileError && (
        <ErrorToast
          message={profileError}
          onClose={() => setProfileError("")}
        />
      )}

      {/* Reset Password */}
      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-brand-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
            />
          </svg>
          <h3 className="text-xs font-semibold tracking-widest text-neutral-500">
            RESET PASSWORD
          </h3>
        </div>

        <div className="mt-5">
          <PasswordField
            id="currentPassword"
            label="OLD PASSWORD"
            required
            placeholder="Enter old password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            show={showCurrent}
            onToggleShow={() => setShowCurrent((v) => !v)}
            autoComplete="current-password"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordField
            id="newPassword"
            label="NEW PASSWORD"
            required
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
            autoComplete="new-password"
            hint="Must be at least 8 characters."
          />
          <PasswordField
            id="confirmNewPassword"
            label="CONFIRM PASSWORD"
            required
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            autoComplete="new-password"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-4 border-t border-neutral-100 pt-4">
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-brand-600 hover:shadow-md disabled:opacity-60"
          >
            {savingPassword && (
              <svg
                className="h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {savingPassword ? "UPDATING…" : "UPDATE PASSWORD"}
          </button>
        </div>
      </form>

      {passwordSaved && (
        <SuccessToast
          message="Password updated successfully!"
          onClose={() => setPasswordSaved(false)}
        />
      )}
      {passwordError && (
        <ErrorToast
          message={passwordError}
          onClose={() => setPasswordError("")}
        />
      )}
    </div>
  );
}
