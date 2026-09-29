import { useEffect, useSyncExternalStore } from "react";

import type { SessionUser } from "@/modules/auth/schemas/auth.schema";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

const subscribeToHydration = (onChange: () => void) =>
  useAuthStore.persist.onFinishHydration(onChange);
const getHydrated = () => useAuthStore.persist.hasHydrated();
// En el servidor (y al hidratar) la sesión siempre está "loading", así el HTML coincide.
const getServerHydrated = () => false;

export function useSession(): { status: SessionStatus; user: SessionUser | null } {
  const user = useAuthStore((s) => s.user);
  // Estado de hidratación compartido: todas las instancias del hook cambian a la vez.
  const hydrated = useSyncExternalStore(subscribeToHydration, getHydrated, getServerHydrated);

  useEffect(() => {
    if (!useAuthStore.persist.hasHydrated()) void useAuthStore.persist.rehydrate();
  }, []);

  if (!hydrated) return { status: "loading", user: null };
  return { status: user ? "authenticated" : "anonymous", user };
}
