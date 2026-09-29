import type { Metadata } from "next";

import { AuthView } from "@/modules/auth/components/auth-view";
import { getSafeRedirect } from "@/modules/auth/services/auth.service";

export const metadata: Metadata = {
  title: "Ingresar | Ticketera",
  robots: { index: false },
};

type IngresarPageProps = { searchParams: Promise<{ redirect?: string | string[] }> };

export default async function IngresarPage({ searchParams }: IngresarPageProps) {
  const { redirect } = await searchParams;
  const redirectTo = getSafeRedirect(Array.isArray(redirect) ? redirect[0] : redirect);

  return <AuthView redirectTo={redirectTo} />;
}
