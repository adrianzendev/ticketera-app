import type { Metadata } from "next";

import { OrganizerDashboardView } from "@/modules/organizer/components/organizer-dashboard-view";

export const metadata: Metadata = {
  title: "Panel de organizador | Ticketera",
  robots: { index: false },
};

type OrganizadorPageProps = { searchParams: Promise<{ creado?: string | string[] }> };

export default async function OrganizadorPage({ searchParams }: OrganizadorPageProps) {
  const { creado } = await searchParams;
  const createdId = (Array.isArray(creado) ? creado[0] : creado) ?? null;

  return <OrganizerDashboardView createdId={createdId} />;
}
