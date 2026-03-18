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
    return <div className="text-[#888] text-sm">Access denied.</div>;
  }

  if (loading) {
    return <div className="text-[#888] text-sm">Loading...</div>;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#fafafa]">Manage Users</h1>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Full Name</th>
              <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Username</th>
              <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Registered</th>
              <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Plan</th>
              <th className="text-right px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#2a2a2a] last:border-0">
                <td className="px-4 py-3 text-[#fafafa]">{user.firstName} {user.lastName}</td>
                <td className="px-4 py-3 text-[#ccc]">{user.email}</td>
                <td className="px-4 py-3">
                  <Link href={`/u/${user.username}`} className="text-[#70E844] hover:underline" target="_blank">
                    {user.username}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#888]">
                  {new Date(user.registeredAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.isBlocked
                      ? "bg-[#FE454E]/15 text-[#FE454E]"
                      : "bg-[#70E844]/15 text-[#70E844]"
                  }`}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {user.isFreeAccess ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#70E844]/15 text-[#70E844]">Free Access</span>
                    ) : user.subscriptionStatus === "active" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#70E844]/15 text-[#70E844]">Pro</span>
                    ) : user.subscriptionStatus === "cancelled" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFA500]/15 text-[#FFA500]">Cancelled</span>
                    ) : user.subscriptionStatus === "past_due" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FE454E]/15 text-[#FE454E]">Past Due</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#888]/15 text-[#888]">Free</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {deletingId === user.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[#FE454E] text-xs">Are you sure?</span>
                      <button onClick={() => deleteUser(user.id)} className="px-3 py-1 rounded text-xs bg-[#FE454E] text-white hover:bg-[#e03d45]">Delete</button>
                      <button onClick={() => setDeletingId(null)} className="px-3 py-1 rounded text-xs bg-[#2a2a2a] text-[#fafafa] hover:bg-[#333]">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleFreeAccess(user.id)}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          user.isFreeAccess
                            ? "bg-[#FFA500]/15 text-[#FFA500] hover:bg-[#FFA500]/25"
                            : "bg-[#70E844]/15 text-[#70E844] hover:bg-[#70E844]/25"
                        }`}
                      >
                        {user.isFreeAccess ? "Revoke Free" : "Grant Free"}
                      </button>
                      <button
                        onClick={() => toggleBlock(user.id)}
                        disabled={togglingId === user.id}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          user.isBlocked
                            ? "bg-[#70E844]/15 text-[#70E844] hover:bg-[#70E844]/25"
                            : "bg-[#FE454E]/15 text-[#FE454E] hover:bg-[#FE454E]/25"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button onClick={() => setDeletingId(user.id)} className="px-3 py-1 rounded text-xs bg-[#2a2a2a] text-[#888] hover:text-[#FE454E] hover:bg-[#FE454E]/10">
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
          <p className="text-[#666] text-sm text-center py-12">No users found.</p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {users.length === 0 && (
          <p className="text-[#666] text-sm text-center py-12">No users found.</p>
        )}
        {users.map((user) => (
          <div key={user.id} className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[#fafafa] font-medium text-sm">{user.firstName} {user.lastName}</p>
                <Link href={`/u/${user.username}`} className="text-[#70E844] text-xs hover:underline" target="_blank">
                  @{user.username}
                </Link>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.isBlocked
                    ? "bg-[#FE454E]/15 text-[#FE454E]"
                    : "bg-[#70E844]/15 text-[#70E844]"
                }`}>
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
                {user.isFreeAccess ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#70E844]/15 text-[#70E844]">Free Access</span>
                ) : user.subscriptionStatus === "active" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#70E844]/15 text-[#70E844]">Pro</span>
                ) : user.subscriptionStatus === "cancelled" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FFA500]/15 text-[#FFA500]">Cancelled</span>
                ) : user.subscriptionStatus === "past_due" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FE454E]/15 text-[#FE454E]">Past Due</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#888]/15 text-[#888]">Free</span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[#888] text-xs truncate">{user.email}</p>
              <p className="text-[#555] text-xs">
                Joined {new Date(user.registeredAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            {deletingId === user.id ? (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[#FE454E] text-xs flex-1">Delete this user?</span>
                <button onClick={() => deleteUser(user.id)} className="px-3 py-1.5 rounded text-xs bg-[#FE454E] text-white hover:bg-[#e03d45]">Confirm</button>
                <button onClick={() => setDeletingId(null)} className="px-3 py-1.5 rounded text-xs bg-[#2a2a2a] text-[#fafafa] hover:bg-[#333]">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  onClick={() => toggleFreeAccess(user.id)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    user.isFreeAccess
                      ? "bg-[#FFA500]/15 text-[#FFA500] hover:bg-[#FFA500]/25"
                      : "bg-[#70E844]/15 text-[#70E844] hover:bg-[#70E844]/25"
                  }`}
                >
                  {user.isFreeAccess ? "Revoke Free" : "Grant Free"}
                </button>
                <button
                  onClick={() => toggleBlock(user.id)}
                  disabled={togglingId === user.id}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    user.isBlocked
                      ? "bg-[#70E844]/15 text-[#70E844] hover:bg-[#70E844]/25"
                      : "bg-[#FE454E]/15 text-[#FE454E] hover:bg-[#FE454E]/25"
                  }`}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>
                <button onClick={() => setDeletingId(user.id)} className="px-3 py-1.5 rounded text-xs bg-[#2a2a2a] text-[#888] hover:text-[#FE454E] hover:bg-[#FE454E]/10">
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
