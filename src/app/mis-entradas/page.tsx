import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MyTicketsView } from "@/modules/order/components/my-tickets-view";

export const metadata: Metadata = {
  title: "Mis entradas | Ticketera",
  robots: { index: false },
};

export default function MisEntradasPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col bg-zinc-100">
        <MyTicketsView />
      </main>
      <SiteFooter />
    </div>
  );
}
