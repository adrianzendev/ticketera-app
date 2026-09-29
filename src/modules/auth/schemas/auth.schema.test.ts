import { describe, expect, it } from "vitest";

import { getFieldErrors, getPersonNameError } from "@/lib/validation";
import { DEMO_ACCOUNTS, DEMO_CREDENTIALS } from "@/modules/auth/data/users.mock";
import {
  EMPTY_LOGIN_VALUES,
  EMPTY_REGISTER_VALUES,
  LOGIN_FIELDS,
  PASSWORD_HINT,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  REGISTER_FIELDS,
  isValidPassword,
  loginSchema,
  registerSchema,
  sessionUserSchema,
} from "@/modules/auth/schemas/auth.schema";

describe("constantes de auth", () => {
  it("AC-5: exporta campos, valores vacíos y reglas de contraseña", () => {
    expect(LOGIN_FIELDS).toEqual(["email", "password"]);
    expect(EMPTY_LOGIN_VALUES).toEqual({ email: "", password: "" });
    expect(REGISTER_FIELDS).toEqual(["fullName", "email", "password", "acceptedTerms"]);
    expect(EMPTY_REGISTER_VALUES).toEqual({
      fullName: "",
      email: "",
      password: "",
      acceptedTerms: false,
    });
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(PASSWORD_MAX_LENGTH).toBe(64);
    expect(PASSWORD_HINT).toBe("Mínimo 8 caracteres, con al menos una letra y un número.");
  });
});

describe("loginSchema", () => {
  it("AC-5: con valores vacíos reporta email y password a la vez", () => {
    expect(getFieldErrors(loginSchema, EMPTY_LOGIN_VALUES)).toEqual({
      email: "Ingresa tu correo electrónico.",
      password: "Ingresa tu contraseña.",
    });
  });

  it("AC-5: rechaza un correo con formato inválido", () => {
    expect(getFieldErrors(loginSchema, { email: "ana@", password: "x" })).toEqual({
      email: "Ingresa un correo válido, por ejemplo tu@email.com.",
    });
  });

  it("AC-5: una contraseña corta no da error de formato", () => {
    expect(getFieldErrors(loginSchema, { email: "ana@mail.com", password: "abc" })).toEqual({});
  });

  it("AC-5: normaliza el correo y deja la contraseña tal cual", () => {
    expect(loginSchema.parse({ email: " ANA@Mail.com ", password: " Demo1234 " })).toEqual({
      email: "ana@mail.com",
      password: " Demo1234 ",
    });
  });
});

describe("isValidPassword", () => {
  it.each(["Demo1234", "clave 2026"])("AC-6: %s es válida", (value) => {
    expect(isValidPassword(value)).toBe(true);
  });

  it.each(["abc12", "abcdefgh", "12345678", `a1${"x".repeat(63)}`])(
    "AC-6: %s no es válida",
    (value) => {
      expect(isValidPassword(value)).toBe(false);
    },
  );

  it("AC-6: acepta exactamente 64 caracteres", () => {
    expect(isValidPassword(`a1${"x".repeat(62)}`)).toBe(true);
  });
});

describe("registerSchema", () => {
  it("AC-6: con valores vacíos reporta los cuatro campos a la vez", () => {
    expect(getFieldErrors(registerSchema, EMPTY_REGISTER_VALUES)).toEqual({
      fullName: "Ingresa tu nombre completo.",
      email: "Ingresa tu correo electrónico.",
      password: "Crea una contraseña.",
      acceptedTerms: "Debes aceptar los términos y condiciones.",
    });
  });

  it("AC-6: rechaza nombre inválido y contraseña sin número", () => {
    expect(
      getFieldErrors(registerSchema, {
        fullName: "Ana",
        email: "ana@mail.com",
        password: "abcdefgh",
        acceptedTerms: true,
      }),
    ).toEqual({
      fullName: "Ingresa tu nombre y apellido, solo con letras.",
      password: "Usa al menos 8 caracteres, con una letra y un número.",
    });
  });

  it("AC-6: normaliza la salida", () => {
    expect(
      registerSchema.parse({
        fullName: " Ana Torres ",
        email: " ANA@mail.com ",
        password: "Demo1234",
        acceptedTerms: true,
      }),
    ).toEqual({
      fullName: "Ana Torres",
      email: "ana@mail.com",
      password: "Demo1234",
      acceptedTerms: true,
    });
  });
});

describe("sessionUserSchema", () => {
  it("AC-6: acepta un usuario válido", () => {
    const user = { id: "usr-1", name: "Ana Torres", email: "ana@mail.com" };
    expect(sessionUserSchema.parse(user)).toEqual(user);
  });

  it("AC-6: rechaza un objeto sin id o con email inválido", () => {
    expect(sessionUserSchema.safeParse({ name: "Ana", email: "ana@mail.com" }).success).toBe(
      false,
    );
    expect(sessionUserSchema.safeParse({ id: "usr-1", name: "Ana", email: "ana@" }).success).toBe(
      false,
    );
  });
});

describe("DEMO_ACCOUNTS", () => {
  it("AC-7: contiene exactamente la cuenta demo", () => {
    expect(DEMO_CREDENTIALS).toEqual({ email: "demo@ticketera.pe", password: "Demo1234" });
    expect(DEMO_ACCOUNTS).toEqual([
      { id: "usr-demo", name: "Ana Torres", email: "demo@ticketera.pe", password: "Demo1234" },
    ]);
  });

  it("AC-7: el nombre demo es válido para el checkout", () => {
    expect(getPersonNameError(DEMO_ACCOUNTS[0].name)).toBeNull();
  });
});
