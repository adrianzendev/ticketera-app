import { describe, expect, it } from "vitest";
import { z } from "zod";

import { getEmailError, getFieldErrors, getPersonNameError, normalizeEmail } from "./validation";

const NAME_ERROR = "Ingresa tu nombre y apellido, solo con letras.";

describe("getPersonNameError", () => {
  it("AC-1: acepta nombre y apellido con tildes y espacios alrededor", () => {
    expect(getPersonNameError("Ana Pérez")).toBeNull();
    expect(getPersonNameError("  María José Núñez ")).toBeNull();
  });

  it("AC-1: pide el nombre si está vacío", () => {
    expect(getPersonNameError("   ")).toBe("Ingresa tu nombre completo.");
  });

  it("AC-1: rechaza una sola palabra o caracteres no permitidos", () => {
    expect(getPersonNameError("Ana")).toBe(NAME_ERROR);
    expect(getPersonNameError("Ana P3rez")).toBe(NAME_ERROR);
  });

  it("AC-1: rechaza más de 80 caracteres", () => {
    expect(getPersonNameError(`Ana ${"a".repeat(77)}`)).toBe(NAME_ERROR);
    expect(getPersonNameError(`Ana ${"a".repeat(76)}`)).toBeNull();
  });
});

describe("getEmailError", () => {
  it("AC-1: pide el correo si está vacío", () => {
    expect(getEmailError("")).toBe("Ingresa tu correo electrónico.");
  });

  it("AC-1: rechaza un formato inválido", () => {
    expect(getEmailError("ana@")).toBe("Ingresa un correo válido, por ejemplo tu@email.com.");
  });

  it("AC-1: acepta un correo con espacios y mayúsculas", () => {
    expect(getEmailError(" Ana@Mail.com ")).toBeNull();
  });
});

describe("normalizeEmail", () => {
  it("AC-1: recorta y pasa a minúsculas", () => {
    expect(normalizeEmail(" Ana@Mail.COM ")).toBe("ana@mail.com");
  });
});

describe("getFieldErrors", () => {
  const schema = z.object({
    name: z.string().min(1, "Falta el nombre.").min(3, "Nombre muy corto."),
    age: z.number().min(18, "Debes ser mayor de edad."),
  });

  it("AC-1: devuelve {} si el parse es válido", () => {
    expect(getFieldErrors(schema, { name: "Ana", age: 20 })).toEqual({});
  });

  it("AC-1: devuelve el primer mensaje de cada campo inválido", () => {
    expect(getFieldErrors<"name" | "age">(schema, { name: "", age: 10 })).toEqual({
      name: "Falta el nombre.",
      age: "Debes ser mayor de edad.",
    });
  });
});
