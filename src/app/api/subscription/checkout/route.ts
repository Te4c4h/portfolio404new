import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function POST() {
  const sessionUser = await requireAuth();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;

  if (!apiKey || !storeId || !variantId) {
    return NextResponse.json({ error: "Payment system not configured" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { email: true, firstName: true, lastName: true, subscriptionStatus: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.subscriptionStatus === "active") {
    return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
  }

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      "Accept": "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            custom: {
              user_id: sessionUser.id,
            },
          },
          product_options: {
            redirect_url: `${process.env.NEXTAUTH_URL}/u/${sessionUser.username}/admin/billing?success=1`,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("LemonSqueezy checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 502 });
  }

  const data = await res.json();
  const checkoutUrl = data.data.attributes.url;

  return NextResponse.json({ url: checkoutUrl });
}
