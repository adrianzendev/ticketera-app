import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  EMPTY_CHECKOUT_VALUES,
  type CheckoutFormValues,
} from "@/modules/order/schemas/checkout.schema";

import { useCheckoutForm } from "./use-checkout-form";

const VALID_VALUES: CheckoutFormValues = {
  fullName: "  Ana Pérez ",
  email: "Ana@Mail.com",
  documentType: "PASSPORT",
  documentNumber: "ab123456",
  phone: "+51 987 654 321",
  paymentMethod: "card",
  cardNumber: "4242 4242 4242 4242",
  cardExpiry: "12/30",
  cardCvv: "123",
  cardName: "ANA PEREZ",
  acceptedTerms: true,
};

const CARD_FIELDS = ["cardNumber", "cardExpiry", "cardCvv", "cardName"] as const;

describe("useCheckoutForm", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-29T12:00:00-05:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("AC-26: arranca con los valores vacíos y sin errores visibles", () => {
    const { result } = renderHook(() => useCheckoutForm());
    expect(result.current.values).toEqual(EMPTY_CHECKOUT_VALUES);
    expect(result.current.errors).toEqual({});
  });

  it("AC-26: blurField muestra solo el error del campo tocado", () => {
    const { result } = renderHook(() => useCheckoutForm());
    act(() => result.current.blurField("email"));
    expect(result.current.errors).toEqual({ email: "Ingresa tu correo electrónico." });
  });

  it("AC-26: setField con un valor válido quita el error visible", () => {
    const { result } = renderHook(() => useCheckoutForm());
    act(() => result.current.blurField("email"));
    act(() => result.current.setField("email", "tu@email.com"));
    expect(result.current.values.email).toBe("tu@email.com");
    expect(result.current.errors).toEqual({});
  });

  it("AC-26: validate() con valores vacíos devuelve fullName y hace visibles todos los errores", () => {
    const { result } = renderHook(() => useCheckoutForm());
    let outcome: ReturnType<typeof result.current.validate> | undefined;
    act(() => {
      outcome = result.current.validate();
    });
    expect(outcome).toEqual({ success: false, firstInvalidField: "fullName" });
    expect(Object.keys(result.current.errors).sort()).toEqual(
      [
        "fullName",
        "email",
        "documentNumber",
        "phone",
        ...CARD_FIELDS,
        "acceptedTerms",
      ].sort(),
    );
  });

  it("AC-26: cambiar a yape quita los errores de tarjeta", () => {
    const { result } = renderHook(() => useCheckoutForm());
    act(() => {
      result.current.validate();
    });
    act(() => result.current.setField("paymentMethod", "yape"));
    for (const field of CARD_FIELDS) expect(result.current.errors[field]).toBeUndefined();
    expect(result.current.errors.fullName).toBe("Ingresa tu nombre completo.");
  });

  it("AC-26: validate() con valores válidos devuelve los datos normalizados", () => {
    const { result } = renderHook(() => useCheckoutForm(VALID_VALUES));
    let outcome: ReturnType<typeof result.current.validate> | undefined;
    act(() => {
      outcome = result.current.validate();
    });
    expect(outcome).toEqual({
      success: true,
      data: {
        fullName: "Ana Pérez",
        email: "ana@mail.com",
        documentType: "PASSPORT",
        documentNumber: "AB123456",
        phone: "987654321",
        paymentMethod: "card",
        cardNumber: "4242424242424242",
        cardExpiry: "12/30",
        cardCvv: "123",
        cardName: "ANA PEREZ",
        acceptedTerms: true,
      },
    });
    expect(result.current.errors).toEqual({});
  });
});
