import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO_CREDENTIALS } from "@/modules/auth/data/users.mock";
import { SIMULATED_AUTH_DELAY_MS } from "@/modules/auth/services/auth.service";
import { AUTH_STORAGE_KEY, useAuthStore } from "@/modules/auth/store/auth.store";

const demoUser = { id: "usr-demo", name: "Ana Torres", email: "demo@ticketera.pe" };

function storedState(): unknown {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

beforeEach(() => {
  vi.useFakeTimers();
  useAuthStore.setState({ user: null });
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAuthStore", () => {
  it("AC-10: arranca sin usuario", () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("AC-10: login guarda el usuario en el store y en localStorage sin contraseña", async () => {
    const promise = useAuthStore.getState().login({ ...DEMO_CREDENTIALS });
    await vi.advanceTimersByTimeAsync(SIMULATED_AUTH_DELAY_MS);

    await expect(promise).resolves.toEqual(demoUser);
    expect(useAuthStore.getState().user).toEqual(demoUser);
    expect(storedState()).toEqual({ state: { user: demoUser }, version: 1 });
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toContain(DEMO_CREDENTIALS.password);
  });

  it("AC-10: un login fallido deja user en null y rechaza", async () => {
    const promise = useAuthStore.getState().login({ email: DEMO_CREDENTIALS.email, password: "x" });
    const assertion = expect(promise).rejects.toThrow("INVALID_CREDENTIALS");
    await vi.advanceTimersByTimeAsync(SIMULATED_AUTH_DELAY_MS);

    await assertion;
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("AC-10: register guarda el usuario nuevo", async () => {
    const email = `nuevo-${Date.now()}@mail.com`;
    const promise = useAuthStore.getState().register({
      fullName: "Luis Ramos",
      email,
      password: "Clave2026",
      acceptedTerms: true,
    });
    await vi.advanceTimersByTimeAsync(SIMULATED_AUTH_DELAY_MS);

    const user = await promise;
    expect(user).toMatchObject({ name: "Luis Ramos", email });
    expect(useAuthStore.getState().user).toEqual(user);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).not.toContain("Clave2026");
  });

  it("AC-10: logout borra el usuario", () => {
    useAuthStore.setState({ user: demoUser });
    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(storedState()).toEqual({ state: { user: null }, version: 1 });
  });

  it("AC-10: rehydrate restaura un usuario válido", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ state: { user: demoUser }, version: 1 }),
    );
    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().user).toEqual(demoUser);
  });

  it("AC-10: rehydrate con un usuario con otra forma deja user en null", async () => {
    useAuthStore.setState({ user: demoUser });
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ state: { user: { id: "", email: "no-es-correo" } }, version: 1 }),
    );
    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().user).toBeNull();
  });

  it("AC-10: rehydrate con JSON corrupto no lanza y deja user en null", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "{no es json");
    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().user).toBeNull();
  });
});
