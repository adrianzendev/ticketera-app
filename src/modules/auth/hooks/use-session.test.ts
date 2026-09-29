import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_STORAGE_KEY } from "@/modules/auth/store/auth.store";

const demoUser = { id: "usr-demo", name: "Ana Torres", email: "demo@ticketera.pe" };

function storeUser(user: unknown) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ state: { user }, version: 1 }));
}

// Módulos frescos en cada test: el store persistido recuerda si ya se rehidrató.
async function loadModules() {
  const [{ useSession }, { useAuthStore }] = await Promise.all([
    import("@/modules/auth/hooks/use-session"),
    import("@/modules/auth/store/auth.store"),
  ]);
  return { useSession, useAuthStore };
}

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

describe("useSession", () => {
  it("AC-11: el primer render es loading", async () => {
    const { useSession } = await loadModules();
    const statuses: string[] = [];
    renderHook(() => {
      const session = useSession();
      statuses.push(session.status);
      return session;
    });

    expect(statuses[0]).toBe("loading");
  });

  it("AC-11: con un usuario válido en localStorage pasa a authenticated", async () => {
    storeUser(demoUser);
    const { useSession } = await loadModules();
    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.status).toBe("authenticated"));
    expect(result.current.user).toEqual(demoUser);
  });

  it("AC-11: sin nada guardado pasa a anonymous", async () => {
    const { useSession } = await loadModules();
    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.status).toBe("anonymous"));
    expect(result.current.user).toBeNull();
  });

  it("AC-11: tras logout pasa a anonymous", async () => {
    storeUser(demoUser);
    const { useSession, useAuthStore } = await loadModules();
    const { result } = renderHook(() => useSession());
    await waitFor(() => expect(result.current.status).toBe("authenticated"));

    act(() => useAuthStore.getState().logout());

    expect(result.current).toEqual({ status: "anonymous", user: null });
  });

  it("AC-11: un hook montado tras la rehidratación no queda en loading", async () => {
    storeUser(demoUser);
    const { useSession, useAuthStore } = await loadModules();
    await useAuthStore.persist.rehydrate();
    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.status).toBe("authenticated"));
  });

  it("AC-11: dos hooks montados a la vez terminan en el mismo estado", async () => {
    storeUser(demoUser);
    const { useSession } = await loadModules();
    const { result } = renderHook(() => ({ navbar: useSession(), page: useSession() }));

    await waitFor(() => expect(result.current.navbar.status).toBe("authenticated"));
    expect(result.current.page).toEqual(result.current.navbar);
  });
});
