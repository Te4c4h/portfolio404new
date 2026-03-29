import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Step 1: Send back to PayPal for verification
  const isLive = process.env.PAYPAL_MODE === "live";
  const verifyUrl = isLive
    ? "https://ipnpb.paypal.com/cgi-bin/webscr"
    : "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr";
  let verifyRes: Response;
  try {
    verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "portfolio404-ipn-handler",
      },
      body: `cmd=_notify-validate&${body}`,
    });
  } catch (err) {
    console.error("[IPN] Failed to reach PayPal verify URL:", err);
    return new NextResponse("VERIFY_FAILED", { status: 500 });
  }

  const verification = await verifyRes.text();

  if (verification !== "VERIFIED") {
    console.warn("[IPN] Invalid IPN — PayPal returned:", verification, "| Body:", body);
    return new NextResponse("INVALID", { status: 200 });
  }

  // Step 2: Parse the IPN fields
  const params = new URLSearchParams(body);
  const paymentStatus = params.get("payment_status");
  const mcGross = params.get("mc_gross");
  const mcCurrency = params.get("mc_currency");
  const payerEmail = params.get("payer_email");
  const receiverEmail = params.get("receiver_email");
  const txnId = params.get("txn_id");
  const customField = params.get("custom"); // userId passed in createOrder

  console.log("[IPN] VERIFIED — status:", paymentStatus, "gross:", mcGross, "currency:", mcCurrency, "payer:", payerEmail, "custom:", customField, "txn:", txnId);

  // Step 3: Validate payment
  if (paymentStatus !== "Completed") {
    console.warn("[IPN] Payment not completed — status:", paymentStatus);
    return new NextResponse("OK", { status: 200 });
  }

  if (mcGross !== "5.00") {
    console.warn("[IPN] Wrong amount — expected 5.00, got:", mcGross);
    return new NextResponse("OK", { status: 200 });
  }

  if (mcCurrency !== "USD") {
    console.warn("[IPN] Wrong currency — expected USD, got:", mcCurrency);
    return new NextResponse("OK", { status: 200 });
  }

  // Validate receiver email if configured
  const expectedEmail = process.env.PAYPAL_RECEIVER_EMAIL;
  if (expectedEmail && receiverEmail !== expectedEmail) {
    console.warn("[IPN] Wrong receiver_email — expected:", expectedEmail, "got:", receiverEmail);
    return new NextResponse("OK", { status: 200 });
  }

  if (!txnId) {
    console.warn("[IPN] Missing txn_id");
    return new NextResponse("OK", { status: 200 });
  }

  // Step 4: Find user — prefer userId from custom field, fall back to payer_email
  let user = null;
  if (customField) {
    // custom field contains userId
    user = await prisma.user.findUnique({ where: { id: customField } });
    if (!user && customField.includes("@")) {
      // custom field might be email (legacy)
      user = await prisma.user.findUnique({ where: { email: customField } });
    }
  }
  if (!user && payerEmail) {
    user = await prisma.user.findUnique({ where: { email: payerEmail } });
  }
  if (!user) {
    console.warn("[IPN] No user found — custom:", customField, "payer_email:", payerEmail);
    return new NextResponse("OK", { status: 200 });
  }

  // Step 5: Idempotency — skip if already paid with same tx
  if (user.isPaid && user.paypalTxId === txnId) {
    console.log("[IPN] Duplicate IPN — already processed txn:", txnId);
    return new NextResponse("OK", { status: 200 });
  }

  // Step 6: Grant access
  await prisma.user.update({
    where: { id: user.id },
    data: { isPaid: true, paypalTxId: txnId },
  });

  console.log("[IPN] Access granted for user:", user.username, "txn:", txnId);

  // Step 7: Send confirmation email
  try {
    await sendPaymentConfirmationEmail(user.email, user.firstName, user.username, txnId);
  } catch (err) {
    console.error("[IPN] Failed to send confirmation email:", err);
  }

  return new NextResponse("OK", { status: 200 });
}
