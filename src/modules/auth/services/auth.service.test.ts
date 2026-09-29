import { afterEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { DEMO_ACCOUNTS, DEMO_CREDENTIALS } from "@/modules/auth/data/users.mock";
import type { RegisterFormValues } from "@/modules/auth/schemas/auth.schema";
import {
  AUTH_ERROR_MESSAGES,
  DEFAULT_REDIRECT,
  createAuthService,
  getAuthErrorMessage,
  getSafeRedirect,
} from "@/modules/auth/services/auth.service";

const createService = () => createAuthService({ delayMs: 0, generateId: () => "usr-test" });

const newAccount: RegisterFormValues = {
  fullName: " Luis Ramos ",
  email: " Luis@Mail.com ",
  password: "Clave2026",
  acceptedTerms: true,
};

afterEach(() => {
  vi.useRealTimers();
});

describe("authService.login", () => {
  it("AC-8: ingresa con la cuenta demo y no devuelve la contraseña", async () => {
    const user = await createService().login({ ...DEMO_CREDENTIALS });
    expect(user).toEqual({ id: "usr-demo", name: "Ana Torres", email: "demo@ticketera.pe" });
    expect(user).not.toHaveProperty("password");
  });

  it("AC-8: acepta el correo con mayúsculas y espacios", async () => {
    const user = await createService().login({
      email: "  DEMO@Ticketera.pe ",
      password: DEMO_CREDENTIALS.password,
    });
    expect(user.id).toBe("usr-demo");
  });

  it("AC-8: contraseña incorrecta (distingue mayúsculas) → INVALID_CREDENTIALS", async () => {
    await expect(
      createService().login({ email: DEMO_CREDENTIALS.email, password: "demo1234" }),
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("AC-8: correo inexistente → INVALID_CREDENTIALS", async () => {
    await expect(
      createService().login({ email: "nadie@mail.com", password: "Demo1234" }),
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("AC-8: valores inválidos rechazan con ZodError", async () => {
    await expect(createService().login({ email: "", password: "" })).rejects.toBeInstanceOf(
      ZodError,
    );
  });

  it("AC-8: no resuelve antes de delayMs", async () => {
    vi.useFakeTimers();
    const service = createAuthService({ delayMs: 800 });
    const onResolve = vi.fn();
    void service.login({ ...DEMO_CREDENTIALS }).then(onResolve);

    await vi.advanceTimersByTimeAsync(799);
    expect(onResolve).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onResolve).toHaveBeenCalledWith({
      id: "usr-demo",
      name: "Ana Torres",
      email: "demo@ticketera.pe",
    });
  });

  it("AC-8: los ZodError rechazan sin esperar el delay", async () => {
    vi.useFakeTimers();
    const service = createAuthService({ delayMs: 800 });
    const onReject = vi.fn();
    void service.login({ email: "", password: "" }).catch(onReject);

    await vi.advanceTimersByTimeAsync(0);
    expect(onReject).toHaveBeenCalledWith(expect.any(ZodError));
  });
});

describe("authService.register", () => {
  it("AC-8: registra y luego permite ingresar con esas credenciales", async () => {
    const service = createService();
    const user = await service.register(newAccount);
    expect(user).toEqual({ id: "usr-test", name: "Luis Ramos", email: "luis@mail.com" });
    expect(user).not.toHaveProperty("password");

    await expect(
      service.login({ email: "luis@mail.com", password: "Clave2026" }),
    ).resolves.toEqual(user);
  });

  it("AC-8: el correo demo en mayúsculas → EMAIL_TAKEN", async () => {
    await expect(
      createService().register({ ...newAccount, email: "DEMO@TICKETERA.PE" }),
    ).rejects.toThrow("EMAIL_TAKEN");
  });

  it("AC-8: valores inválidos rechazan con ZodError", async () => {
    await expect(
      createService().register({ ...newAccount, acceptedTerms: false }),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it("AC-8: dos instancias no comparten cuentas y DEMO_ACCOUNTS no cambia", async () => {
    const snapshot = structuredClone(DEMO_ACCOUNTS);
    const first = createService();
    const second = createService();
    await first.register(newAccount);

    await expect(
      second.login({ email: "luis@mail.com", password: "Clave2026" }),
    ).rejects.toThrow("INVALID_CREDENTIALS");
    expect(DEMO_ACCOUNTS).toEqual(snapshot);
    expect(DEMO_ACCOUNTS).toHaveLength(1);
  });
});

describe("getAuthErrorMessage", () => {
  it("AC-8: devuelve el mensaje de cada código", () => {
    expect(getAuthErrorMessage(new Error("INVALID_CREDENTIALS"))).toBe(
      "Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.",
    );
    expect(getAuthErrorMessage(new Error("EMAIL_TAKEN"))).toBe(
      "Ya existe una cuenta con este correo. Inicia sesión.",
    );
  });

  it("AC-8: cualquier otro error o valor → UNKNOWN", () => {
    const unknown = "No pudimos completar la operación. Inténtalo de nuevo.";
    expect(AUTH_ERROR_MESSAGES.UNKNOWN).toBe(unknown);
    expect(getAuthErrorMessage(new Error("boom"))).toBe(unknown);
    expect(getAuthErrorMessage("INVALID_CREDENTIALS")).toBe(unknown);
    expect(getAuthErrorMessage(undefined)).toBe(unknown);
  });
});

describe("getSafeRedirect", () => {
  it.each(["/mis-entradas", "/", "/eventos/romeo-y-julieta-teatro-municipal?x=1"])(
    "AC-9: %s se devuelve igual",
    (value) => {
      expect(getSafeRedirect(value)).toBe(value);
    },
  );

  it.each([
    "https://malicioso.com",
    "//malicioso.com",
    "/\\malicioso.com",
    "mis-entradas",
    "",
    null,
    undefined,
    "/ingresar?redirect=/x",
    "/\t/malicioso.com",
    "/\n/malicioso.com",
    "/\r/malicioso.com",
    "/ /malicioso.com",
    "/eventos\u0000",
  ])("AC-9: %s → /mis-entradas", (value) => {
    expect(getSafeRedirect(value)).toBe("/mis-entradas");
  });

  it("AC-9: usa el fallback indicado", () => {
    expect(DEFAULT_REDIRECT).toBe("/mis-entradas");
    expect(getSafeRedirect("//x", "/")).toBe("/");
  });
});
