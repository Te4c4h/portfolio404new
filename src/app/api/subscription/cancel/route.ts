import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function POST() {
  const sessionUser = await requireAuth();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Payment system not configured" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { subscriptionId: true, subscriptionStatus: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!user.subscriptionId || user.subscriptionStatus !== "active") {
    return NextResponse.json({ error: "No active subscription to cancel" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.lemonsqueezy.com/v1/subscriptions/${user.subscriptionId}`,
    {
      method: "PATCH",
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "subscriptions",
          id: user.subscriptionId,
          attributes: {
            cancelled: true,
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("LemonSqueezy cancel error:", err);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 502 });
  }

  await prisma.user.update({
    where: { id: sessionUser.id },
    data: { subscriptionStatus: "cancelled" },
  });

  return NextResponse.json({ success: true });
}
