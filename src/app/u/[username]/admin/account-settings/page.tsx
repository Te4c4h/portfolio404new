"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Toast from "@/components/Toast";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isOAuth: boolean;
}

export default function AccountSettingsPage() {
  const params = useParams();
  const currentUsername = params.username as string;
  const { data: session, update: updateSession } = useSession();
  const isAdmin = session?.user?.isAdmin === true;
  const { t } = useTranslation();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Username fields
  const [newUsername, setNewUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "same">("idle");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data && !data.error) {
        setProfile(data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setNewUsername(data.username || "");
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // Debounced username check
  useEffect(() => {
    if (!profile) return;
    const trimmed = newUsername.trim().toLowerCase();
    if (trimmed === profile.username) {
      setUsernameStatus("same");
      return;
    }
    if (trimmed.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [newUsername, profile]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
  };

  // Save profile
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (res.ok) {
        await updateSession();
        showToast("Profile updated!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save");
      }
    } catch {
      alert("Network error");
    }
    setSavingProfile(false);
  };

  // Save username
  const handleSaveUsername = async () => {
    setUsernameError("");
    const trimmed = newUsername.trim().toLowerCase();
    if (trimmed === profile?.username) return;
    if (usernameStatus !== "available") {
      setUsernameError("Username is not available");
      return;
    }
    setSavingUsername(true);
    try {
      const res = await fetch("/api/user/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        // Force session refresh so JWT picks up new username from DB
        await updateSession();
        showToast("Username updated! Redirecting...");
        setTimeout(() => {
          window.location.href = `/u/${data.username}/admin/account-settings`;
        }, 1500);
      } else {
        setUsernameError(data.error || "Failed to update");
      }
    } catch {
      setUsernameError("Network error");
    }
    setSavingUsername(false);
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Password changed!");
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to change password");
      }
    } catch {
      setPasswordError("Network error");
    }
    setSavingPassword(false);
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const r = await fetch("/api/user/account", { method: "DELETE" });
      if (r.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        const err = await r.json().catch(() => ({}));
        alert(err.error || `Delete failed (${r.status})`);
        setDeleting(false);
        setDeleteModalOpen(false);
      }
    } catch (e) {
      console.error("Delete account error:", e);
      alert("Network error — please try again");
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">Loading...</div>;
  if (!profile) return <div className="text-[var(--muted)] text-sm">Could not load profile.</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Account Settings</h1>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">First Name</label>
              <input className="dash-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" />
            </div>
            <div>
              <label className="text-xs text-[var(--muted)] mb-1 block">Last Name</label>
              <input className="dash-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-[var(--muted)] mb-1 block">Email</label>
            <input className="dash-input opacity-50 cursor-not-allowed" value={profile.email} readOnly />
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Username & Portfolio URL */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Username & Portfolio URL</h2>
          <p className="text-xs text-[var(--danger)]/80 mb-3">⚠ Changing your username will change your portfolio URL.</p>
          <div className="mb-3">
            <label className="text-xs text-[var(--muted)] mb-1 block">Username</label>
            <div className="relative">
              <input
                className="dash-input pr-10"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="username"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && (
                  <svg className="animate-spin h-4 w-4 text-[var(--muted)]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {usernameStatus === "available" && (
                  <svg className="h-4 w-4 text-[var(--accent)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {usernameStatus === "taken" && (
                  <svg className="h-4 w-4 text-[var(--danger)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </div>
            {usernameStatus === "taken" && (
              <p className="text-[var(--danger)] text-xs mt-1">Username is already taken</p>
            )}
            {usernameStatus === "available" && (
              <p className="text-[var(--accent)] text-xs mt-1">Username is available</p>
            )}
            <p className="text-[var(--muted-foreground)] text-xs mt-1">
              Portfolio URL: <span className="text-[var(--muted)]">portfolio404.site/u/{newUsername.trim().toLowerCase() || currentUsername}</span>
            </p>
          </div>
          {usernameError && <p className="text-[var(--danger)] text-sm mb-3">{usernameError}</p>}
          <button
            onClick={handleSaveUsername}
            disabled={savingUsername || usernameStatus !== "available"}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {savingUsername ? "Updating..." : "Change Username"}
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-4">Change Password</h2>
          {profile.isOAuth ? (
            <p className="text-[var(--muted)] text-sm">Your account uses Google sign-in. Password change is not available.</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-[var(--muted)] mb-1 block">Current Password</label>
                  <input type="password" className="dash-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)] mb-1 block">New Password</label>
                  <input type="password" className="dash-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" />
                </div>
                <div>
                  <label className="text-xs text-[var(--muted)] mb-1 block">Confirm New Password</label>
                  <input type="password" className="dash-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                </div>
              </div>
              {passwordError && <p className="text-[var(--danger)] text-sm mb-3">{passwordError}</p>}
              {passwordSuccess && <p className="text-[var(--accent)] text-sm mb-3">Password changed successfully!</p>}
              <button onClick={handleChangePassword} disabled={savingPassword} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
                {savingPassword ? "Saving..." : "Change Password"}
              </button>
            </>
          )}
        </div>

        {/* Danger Zone — hidden for admin */}
        {!isAdmin && (
          <div className="bg-[var(--surface)] border border-[var(--danger)]/30 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-[var(--danger)] uppercase tracking-wider mb-2">{t("accountSettings.dangerZone")}</h2>
            <p className="text-[var(--muted)] text-sm mb-4">{t("accountSettings.dangerDesc")}</p>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 hover:bg-[var(--danger)]/20 transition-colors"
            >
              {t("accountSettings.deleteAccount")}
            </button>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Modal */}
      {!isAdmin && deleteModalOpen && (
        <div className="fixed inset-0 bg-[var(--overlay)] z-50 flex items-center justify-center p-4" onClick={() => setDeleteModalOpen(false)}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Delete Account</h2>
            <p className="text-[var(--muted)] text-sm mb-4">
              This will permanently delete your account, portfolio, sections, content, analytics, and all settings. This cannot be undone.
            </p>
            <p className="text-[var(--muted)] text-sm mb-2">
              Type <strong className="text-[var(--danger)]">{profile.username}</strong> to confirm:
            </p>
            <input
              className="dash-input mb-4"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={profile.username}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setDeleteModalOpen(false); setDeleteConfirm(""); }} className="px-4 py-2 rounded-lg text-sm bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm !== profile.username}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMsg} show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
