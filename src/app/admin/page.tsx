"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  isBlocked: boolean;
  registeredAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isAdmin) {
      router.replace(session ? `/u/${session.user.username}/admin` : "/login");
    }
  }, [session, status, router]);

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

  const deleteUser = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeletingId(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="text-[#888] text-sm">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#131313] text-[#fafafa] p-6">
      <style>{`
        html, body {
          background-color: #131313 !important;
          color: #fafafa !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `}</style>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#fafafa]">Admin Panel</h1>
          <Link
            href={`/u/${session.user.username}/admin`}
            className="text-sm text-[#888] hover:text-[#70E844] transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Full Name</th>
                <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Username</th>
                <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Registered</th>
                <th className="text-left px-4 py-3 text-[#888] font-medium text-xs uppercase tracking-wider">Status</th>
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
                  <td className="px-4 py-3 text-right">
                    {deletingId === user.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[#FE454E] text-xs">Are you sure? This will permanently delete the user and all their data.</span>
                        <button onClick={() => deleteUser(user.id)} className="px-3 py-1 rounded text-xs bg-[#FE454E] text-white hover:bg-[#e03d45]">Delete</button>
                        <button onClick={() => setDeletingId(null)} className="px-3 py-1 rounded text-xs bg-[#2a2a2a] text-[#fafafa] hover:bg-[#333]">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
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
      </div>
    </div>
  );
}
