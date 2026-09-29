import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { useValidatedForm } from "./use-validated-form";

type Values = { name: string; email: string };
type Data = Values;

const schema: z.ZodType<Data, Values> = z
  .object({ name: z.string(), email: z.string() })
  .superRefine((values, ctx) => {
    if (!values.name.trim())
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        message: "Falta el nombre.",
      });
    if (!values.email.includes("@")) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Correo inválido.",
      });
    }
  })
  .transform((values) => ({
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
  }));

const FIELDS = ["name", "email"] as const;
const EMPTY: Values = { name: "", email: "" };

function renderForm(initialValues: Values = EMPTY) {
  return renderHook(() =>
    useValidatedForm({ schema, fields: FIELDS, initialValues }),
  );
}

describe("useValidatedForm", () => {
  it("AC-3: arranca sin errores visibles", () => {
    const { result } = renderForm();
    expect(result.current.values).toEqual(EMPTY);
    expect(result.current.errors).toEqual({});
  });

  it("AC-3: blurField muestra solo el error de ese campo", () => {
    const { result } = renderForm();
    act(() => result.current.blurField("email"));
    expect(result.current.errors).toEqual({ email: "Correo inválido." });
  });

  it("AC-3: setField con un valor válido quita el error visible", () => {
    const { result } = renderForm();
    act(() => result.current.blurField("email"));
    act(() => result.current.setField("email", "ana@mail.com"));
    expect(result.current.values.email).toBe("ana@mail.com");
    expect(result.current.errors).toEqual({});
  });

  it("AC-3: validate() inválido devuelve el primer campo según fields y muestra todos los errores", () => {
    const { result } = renderForm();
    let outcome: ReturnType<typeof result.current.validate> | undefined;
    act(() => {
      outcome = result.current.validate();
    });
    expect(outcome).toEqual({ success: false, firstInvalidField: "name" });
    expect(result.current.errors).toEqual({
      name: "Falta el nombre.",
      email: "Correo inválido.",
    });
  });

  it("AC-3: validate() válido devuelve los datos transformados", () => {
    const { result } = renderForm({ name: "  Ana ", email: " Ana@Mail.com " });
    let outcome: ReturnType<typeof result.current.validate> | undefined;
    act(() => {
      outcome = result.current.validate();
    });
    expect(outcome).toEqual({
      success: true,
      data: { name: "Ana", email: "ana@mail.com" },
    });
    expect(result.current.errors).toEqual({});
  });

  it("AC-3: respeta initialValues", () => {
    const initialValues = { name: "Ana", email: "ana@mail.com" };
    const { result } = renderForm(initialValues);
    expect(result.current.values).toEqual(initialValues);
  });

  it("AC-3: setField y blurField son estables entre renders", () => {
    const { result } = renderForm();
    const { setField, blurField } = result.current;
    act(() => result.current.setField("name", "Ana"));
    expect(result.current.setField).toBe(setField);
    expect(result.current.blurField).toBe(blurField);
  });
});
