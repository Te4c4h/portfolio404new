"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CompleteSignupPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const email = session?.user?.email || "";
  const googleName = session?.user?.googleName || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    if (googleName) {
      const parts = googleName.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [googleName]);

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`);
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameStatus("idle");
      return;
    }
    const timer = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required");
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError("Username must be 3–20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError("Only letters, numbers, hyphens, and underscores");
      return;
    }
    if (usernameStatus === "taken") {
      setError("Username is already taken");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, username }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      // Refresh the session so JWT picks up the new DB user
      await update();
      router.push(`/u/${data.user.username}/admin`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <p className="text-[var(--danger)] font-medium mb-4">Invalid signup link.</p>
          <a href="/login" className="text-[var(--accent)] text-sm hover:underline">Go to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8">
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2 text-center">Complete Your Profile</h1>
        <p className="text-[var(--muted)] text-sm text-center mb-6">Choose a username to finish setting up your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--muted)] mb-1 block">Email</label>
            <input type="email" value={email} readOnly className="auth-input opacity-50 cursor-not-allowed" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="auth-input"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input pr-10"
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
          </div>
          {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
