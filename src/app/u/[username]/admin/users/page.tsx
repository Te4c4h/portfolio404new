"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isBlocked: boolean;
  registeredAt: string;
  subscriptionStatus: string;
  isFreeAccess: boolean;
}

export default function ManageUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/users");
    if (r.ok) setUsers(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user?.isAdmin) load();
  }, [session, load]);

  const toggleBlock = async (id: string) => {
    setTogglingId(id);
    const r = await fetch(`/api/users/${id}`, { method: "PUT" });
    if (r.ok) {
      const updated = await r.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
    setTogglingId(null);
  };

  const toggleFreeAccess = async (id: string) => {
    const r = await fetch(`/api/users/${id}`, { method: "PATCH" });
    if (r.ok) {
      const updated = await r.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    }
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeletingId(null);
  };

  if (!session?.user?.isAdmin) {
    return <div className="text-[var(--muted)] text-sm">Access denied.</div>;
  }

  if (loading) {
    return <div className="text-[var(--muted)] text-sm">Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Manage Users</h1>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium text-xs uppercase tracking-wider">Full Name</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium text-xs uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium text-xs uppercase tracking-wider">Username</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium text-xs uppercase tracking-wider">Registered</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-[var(--muted)] font-medium text-xs uppercase tracking-wider">Plan</th>
              <th className="text-right px-4 py-3 text-[var(--muted)] font-medium text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 text-[var(--foreground)]">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-[var(--background)]">{user.email}</td>
                <td className="px-4 py-3">
                  <Link href={`/u/${user.username}`} className="text-[var(--accent)] hover:underline" target="_blank">
                    {user.username}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {new Date(user.registeredAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.isBlocked
                      ? "bg-[var(--danger)]/15 text-[var(--danger)]"
                      : "bg-[var(--accent)]/15 text-[var(--accent)]"
                  }`}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {user.isFreeAccess ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">Free Access</span>
                    ) : user.subscriptionStatus === "active" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">Pro</span>
                    ) : user.subscriptionStatus === "cancelled" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--warning)]/15 text-[var(--warning)]">Cancelled</span>
                    ) : user.subscriptionStatus === "past_due" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--danger)]/15 text-[var(--danger)]">Past Due</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)]/15 text-[var(--muted)]">Free</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {deletingId === user.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[var(--danger)] text-xs">Are you sure?</span>
                      <button onClick={() => deleteUser(user.id)} className="px-3 py-1 rounded text-xs bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]">Delete</button>
                      <button onClick={() => setDeletingId(null)} className="px-3 py-1 rounded text-xs bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleFreeAccess(user.id)}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          user.isFreeAccess
                            ? "bg-[var(--warning)]/15 text-[var(--warning)] hover:bg-[var(--accent-hover)]/25"
                            : "bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25"
                        }`}
                      >
                        {user.isFreeAccess ? "Revoke Free" : "Grant Free"}
                      </button>
                      <button
                        onClick={() => toggleBlock(user.id)}
                        disabled={togglingId === user.id}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          user.isBlocked
                            ? "bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25"
                            : "bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button onClick={() => setDeletingId(user.id)} className="px-3 py-1 rounded text-xs bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10">
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-[var(--muted)] text-sm text-center py-12">No users found.</p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {users.length === 0 && (
          <p className="text-[var(--muted)] text-sm text-center py-12">No users found.</p>
        )}
        {users.map((user) => (
          <div key={user.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[var(--foreground)] font-medium text-sm">{user.firstName} {user.lastName}</p>
                <Link href={`/u/${user.username}`} className="text-[var(--accent)] text-xs hover:underline" target="_blank">
                  @{user.username}
                </Link>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.isBlocked
                    ? "bg-[var(--danger)]/15 text-[var(--danger)]"
                    : "bg-[var(--accent)]/15 text-[var(--accent)]"
                }`}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
                {user.isFreeAccess ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">Free Access</span>
                ) : user.subscriptionStatus === "active" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">Pro</span>
                ) : user.subscriptionStatus === "cancelled" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--warning)]/15 text-[var(--warning)]">Cancelled</span>
                ) : user.subscriptionStatus === "past_due" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--danger)]/15 text-[var(--danger)]">Past Due</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)]/15 text-[var(--muted)]">Free</span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--muted)] text-xs truncate">{user.email}</p>
              <p className="text-[var(--muted-foreground)] text-xs">
                Joined {new Date(user.registeredAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            {deletingId === user.id ? (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[var(--danger)] text-xs flex-1">Delete this user?</span>
                <button onClick={() => deleteUser(user.id)} className="px-3 py-1.5 rounded text-xs bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)]">Confirm</button>
                <button onClick={() => setDeletingId(null)} className="px-3 py-1.5 rounded text-xs bg-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => toggleFreeAccess(user.id)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    user.isFreeAccess
                      ? "bg-[var(--warning)]/15 text-[var(--warning)] hover:bg-[var(--accent-hover)]/25"
                      : "bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25"
                  }`}
                >
                  {user.isFreeAccess ? "Revoke Free" : "Grant Free"}
                </button>
                <button
                  onClick={() => toggleBlock(user.id)}
                  disabled={togglingId === user.id}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    user.isBlocked
                      ? "bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25"
                      : "bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25"
                  }`}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>
                <button onClick={() => setDeletingId(user.id)} className="px-3 py-1.5 rounded text-xs bg-[var(--border)] text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
