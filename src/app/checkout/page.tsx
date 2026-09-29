import type { Metadata } from "next";

import { CheckoutView } from "@/modules/order/components/checkout-view";

export const metadata: Metadata = {
  title: "Datos y pago | Ticketera",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-100">
      <CheckoutView />
    </div>
  );
}
