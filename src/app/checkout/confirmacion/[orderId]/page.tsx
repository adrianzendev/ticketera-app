import type { Metadata } from "next";

import { OrderConfirmation } from "@/modules/order/components/order-confirmation";
import { PurchaseStepsHeader } from "@/modules/order/components/purchase-steps-header";

type ConfirmationPageProps = { params: Promise<{ orderId: string }> };

export const metadata: Metadata = {
  title: "Compra confirmada | Ticketera",
  robots: { index: false },
};

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = await params;

  return (
    <div className="flex flex-1 flex-col bg-zinc-100">
      <PurchaseStepsHeader currentStep={3} />

      <main className="flex flex-1 flex-col items-center px-4 pt-7 pb-9 lg:px-20 lg:pt-14 lg:pb-18">
        <OrderConfirmation orderId={orderId} />
      </main>
    </div>
  );
}
