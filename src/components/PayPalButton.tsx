"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

interface PayPalButtonProps {
  userEmail: string;
}

export default function PayPalButton({ userEmail }: PayPalButtonProps) {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createOrder = (_data: any, actions: any) => {
    return actions.order.create({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "5.00",
          },
          description: "Portfolio 404 — Lifetime Access",
          custom_id: userEmail,
        },
      ],
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onApprove = async (_data: any, actions: any) => {
    if (!actions.order) return;
    await actions.order.capture();
    router.push("/payment/success");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = (err: any) => {
    console.error("[PayPal] Error:", err);
  };

  if (!clientId) {
    return (
      <div className="w-full py-3 rounded-xl text-center text-sm text-[var(--muted)] border border-[var(--border)]">
        Payment not configured. Contact the administrator.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "buynow", height: 48 }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
}
