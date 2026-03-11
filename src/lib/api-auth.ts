import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !user.isAdmin) return null;
  return user;
}
