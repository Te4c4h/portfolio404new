"use client";

import { PayPalScriptProvider, PayPalButtons, type CreateOrderActions, type OnApproveActions, type OnApproveData } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";

interface PayPalButtonProps {
  userEmail: string;
}

export default function PayPalButton({ userEmail }: PayPalButtonProps) {
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  const createOrder = (_data: Record<string, unknown>, actions: CreateOrderActions) => {
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

  const onApprove = async (_data: OnApproveData, actions: OnApproveActions) => {
    if (!actions.order) return;
    await actions.order.capture();
    router.push("/payment/success");
  };

  const onError = (err: Record<string, unknown>) => {
    console.error("[PayPal] Error:", err);
  };

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
