import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || "";

  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (hmac !== signature) {
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const meta = payload.meta as Record<string, unknown> | undefined;
  const eventName = meta?.event_name as string | undefined;
  const data = payload.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;

  if (!eventName || !attributes) {
    return NextResponse.json({ error: "Missing event data" }, { status: 400 });
  }

  // Extract user_id from custom data
  const customData = meta?.custom_data as Record<string, string> | undefined;
  const userId = customData?.user_id;

  if (!userId) {
    console.error("Webhook missing user_id in custom_data");
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const subscriptionId = String(data?.id || "");
  const customerId = String(attributes.customer_id || "");
  const renewsAt = attributes.renews_at as string | null;

  try {
    switch (eventName) {
      case "subscription_created": {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "active",
            subscriptionId,
            customerId,
            currentPeriodEnd: renewsAt ? new Date(renewsAt) : null,
          },
        });
        break;
      }

      case "subscription_updated": {
        const status = attributes.status as string;
        const mappedStatus =
          status === "active" ? "active" :
          status === "cancelled" ? "cancelled" :
          status === "past_due" ? "past_due" :
          status === "expired" ? "free" : undefined;

        await prisma.user.update({
          where: { id: userId },
          data: {
            ...(mappedStatus ? { subscriptionStatus: mappedStatus } : {}),
            currentPeriodEnd: renewsAt ? new Date(renewsAt) : undefined,
          },
        });
        break;
      }

      case "subscription_cancelled": {
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "cancelled" },
        });
        break;
      }

      case "subscription_expired": {
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: "free",
            subscriptionId: null,
            customerId: null,
            currentPeriodEnd: null,
          },
        });
        break;
      }

      case "subscription_payment_failed": {
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "past_due" },
        });
        break;
      }

      default:
        console.log(`Unhandled LemonSqueezy event: ${eventName}`);
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
