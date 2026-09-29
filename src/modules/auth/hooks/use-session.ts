import { useEffect, useState } from "react";

import type { SessionUser } from "@/modules/auth/schemas/auth.schema";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export function useSession(): { status: SessionStatus; user: SessionUser | null } {
  const user = useAuthStore((s) => s.user);
  // Arranca en false para que el primer render en cliente coincida con el HTML del servidor.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) {
      // En una microtarea: un setState síncrono en el efecto provocaría renders en cascada.
      void Promise.resolve().then(() => setHydrated(true));
    } else {
      void useAuthStore.persist.rehydrate();
    }
    return unsubscribe;
  }, []);

  if (!hydrated) return { status: "loading", user: null };
  return { status: user ? "authenticated" : "anonymous", user };
}
