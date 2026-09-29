import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CHECKOUT_FIELDS,
  DOCUMENT_TYPE_OPTIONS,
  EMPTY_CHECKOUT_VALUES,
  PAYMENT_METHOD_OPTIONS,
  checkoutSchema,
  formatCardExpiry,
  formatCardNumber,
  getCheckoutErrors,
  isValidCardExpiry,
  isValidLuhn,
  type CheckoutFormValues,
} from "@/modules/order/schemas/checkout.schema";

const validValues: CheckoutFormValues = {
  fullName: "Ana Pérez",
  email: "Ana@Email.com",
  documentType: "DNI",
  documentNumber: "12345678",
  phone: "987654321",
  paymentMethod: "card",
  cardNumber: "4242 4242 4242 4242",
  cardExpiry: "12/30",
  cardCvv: "123",
  cardName: "ANA PEREZ",
  acceptedTerms: true,
};

function errorsFor(patch: Partial<CheckoutFormValues>) {
  return getCheckoutErrors({ ...validValues, ...patch });
}

afterEach(() => {
  vi.useRealTimers();
});

describe("constantes de checkout", () => {
  it("AC-1: opciones, orden de campos y valores vacíos exactos", () => {
    expect(DOCUMENT_TYPE_OPTIONS).toEqual([
      { value: "DNI", label: "DNI" },
      { value: "CE", label: "CE" },
      { value: "PASSPORT", label: "Pasaporte" },
    ]);
    expect(PAYMENT_METHOD_OPTIONS).toEqual([
      { value: "card", label: "Tarjeta", mobileLabel: "Tarjeta de crédito o débito" },
      { value: "yape", label: "Yape", mobileLabel: "Yape" },
      { value: "cash", label: "PagoEfectivo", mobileLabel: "PagoEfectivo" },
    ]);
    expect(CHECKOUT_FIELDS).toEqual([
      "fullName",
      "email",
      "documentType",
      "documentNumber",
      "phone",
      "paymentMethod",
      "cardNumber",
      "cardExpiry",
      "cardCvv",
      "cardName",
      "acceptedTerms",
    ]);
    expect(EMPTY_CHECKOUT_VALUES).toEqual({
      fullName: "",
      email: "",
      documentType: "DNI",
      documentNumber: "",
      phone: "",
      paymentMethod: "card",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      cardName: "",
      acceptedTerms: false,
    });
  });

  it("AC-1: safeParse de los valores vacíos falla", () => {
    expect(checkoutSchema.safeParse(EMPTY_CHECKOUT_VALUES).success).toBe(false);
  });
});

describe("checkoutSchema: comprador", () => {
  it("AC-2: fullName acepta nombres con tildes y rechaza una palabra o dígitos", () => {
    expect(errorsFor({ fullName: "Ana Pérez" }).fullName).toBeUndefined();
    expect(errorsFor({ fullName: "  María José Núñez " }).fullName).toBeUndefined();
    expect(errorsFor({ fullName: "Ana" }).fullName).toBe(
      "Ingresa tu nombre y apellido, solo con letras.",
    );
    expect(errorsFor({ fullName: "Ana P3rez" }).fullName).toBe(
      "Ingresa tu nombre y apellido, solo con letras.",
    );
    expect(errorsFor({ fullName: "   " }).fullName).toBe("Ingresa tu nombre completo.");
    expect(errorsFor({ fullName: `Ana ${"a".repeat(80)}` }).fullName).toBe(
      "Ingresa tu nombre y apellido, solo con letras.",
    );
  });

  it("AC-2: email vacío o inválido con su mensaje", () => {
    expect(errorsFor({ email: "" }).email).toBe("Ingresa tu correo electrónico.");
    expect(errorsFor({ email: "ana@" }).email).toBe(
      "Ingresa un correo válido, por ejemplo tu@email.com.",
    );
  });

  it("AC-2: documento según tipo, con el error siempre en documentNumber", () => {
    expect(errorsFor({ documentType: "DNI", documentNumber: "12345678" })).toEqual({});
    expect(errorsFor({ documentType: "DNI", documentNumber: "1234567" })).toEqual({
      documentNumber: "El DNI debe tener 8 dígitos.",
    });
    expect(errorsFor({ documentType: "DNI", documentNumber: "1234567a" }).documentNumber).toBe(
      "El DNI debe tener 8 dígitos.",
    );
    expect(errorsFor({ documentType: "CE", documentNumber: "123456789" })).toEqual({});
    expect(errorsFor({ documentType: "CE", documentNumber: "12345678" })).toEqual({
      documentNumber: "El carné de extranjería debe tener 9 dígitos.",
    });
    expect(errorsFor({ documentType: "PASSPORT", documentNumber: "ab123456" })).toEqual({});
    expect(errorsFor({ documentType: "PASSPORT", documentNumber: "AB-123456" })).toEqual({
      documentNumber: "El pasaporte debe tener entre 6 y 12 letras o números.",
    });
    expect(errorsFor({ documentNumber: " " }).documentNumber).toBe(
      "Ingresa tu número de documento.",
    );
  });

  it("AC-2: celular peruano con prefijo opcional y separadores", () => {
    for (const phone of ["987654321", "987 654 321", "+51 987654321", "51-987-654-321"]) {
      expect(errorsFor({ phone }).phone).toBeUndefined();
    }
    for (const phone of ["887654321", "98765432"]) {
      expect(errorsFor({ phone }).phone).toBe(
        "Ingresa un celular peruano de 9 dígitos que empiece con 9.",
      );
    }
    expect(errorsFor({ phone: "" }).phone).toBe("Ingresa tu número de celular.");
  });

  it("AC-2 y AC-3: normaliza la salida", () => {
    const data = checkoutSchema.parse({
      ...validValues,
      fullName: "  María José Núñez ",
      email: " Ana@Email.COM ",
      documentType: "PASSPORT",
      documentNumber: "ab123456",
      phone: "+51 987 654 321",
      cardNumber: "4242-4242-4242-4242",
    });
    expect(data).toEqual({
      ...validValues,
      fullName: "María José Núñez",
      email: "ana@email.com",
      documentType: "PASSPORT",
      documentNumber: "AB123456",
      phone: "987654321",
      cardNumber: "4242424242424242",
    });
  });
});

describe("checkoutSchema: pago", () => {
  it("AC-3: número de tarjeta vacío o inválido", () => {
    expect(errorsFor({ cardNumber: "" }).cardNumber).toBe("Ingresa el número de tarjeta.");
    expect(errorsFor({ cardNumber: "4242 4242 4242 4241" }).cardNumber).toBe(
      "El número de tarjeta no es válido.",
    );
    expect(errorsFor({ cardNumber: "4242" }).cardNumber).toBe("El número de tarjeta no es válido.");
  });

  it("AC-3: vencimiento con formato y vigencia según la fecha del sistema", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-29T12:00:00-05:00"));
    expect(errorsFor({ cardExpiry: "" }).cardExpiry).toBe("Ingresa la fecha de vencimiento.");
    expect(errorsFor({ cardExpiry: "0927" }).cardExpiry).toBe("Usa el formato MM/AA.");
    expect(errorsFor({ cardExpiry: "13/27" }).cardExpiry).toBe("Usa el formato MM/AA.");
    expect(errorsFor({ cardExpiry: "08/26" }).cardExpiry).toBe("La tarjeta está vencida.");
    expect(errorsFor({ cardExpiry: "09/26" }).cardExpiry).toBeUndefined();
  });

  it("AC-3: CVV y nombre en la tarjeta", () => {
    expect(errorsFor({ cardCvv: "" }).cardCvv).toBe("Ingresa el CVV.");
    expect(errorsFor({ cardCvv: "12" }).cardCvv).toBe("El CVV tiene 3 o 4 dígitos.");
    expect(errorsFor({ cardCvv: "1234" }).cardCvv).toBeUndefined();
    expect(errorsFor({ cardName: " A " }).cardName).toBe(
      "Ingresa el nombre como aparece en la tarjeta.",
    );
    expect(errorsFor({ cardName: "A".repeat(27) }).cardName).toBe(
      "Ingresa el nombre como aparece en la tarjeta.",
    );
  });

  it("AC-3: términos no aceptados", () => {
    expect(errorsFor({ acceptedTerms: false })).toEqual({
      acceptedTerms: "Debes aceptar los términos y condiciones.",
    });
  });

  it("AC-3: con yape o cash ignora la tarjeta y la devuelve vacía", () => {
    for (const paymentMethod of ["yape", "cash"] as const) {
      const garbage = {
        paymentMethod,
        cardNumber: "abc",
        cardExpiry: "99/99",
        cardCvv: "x",
        cardName: "",
      };
      expect(errorsFor(garbage)).toEqual({});
      expect(checkoutSchema.parse({ ...validValues, ...garbage })).toMatchObject({
        paymentMethod,
        cardNumber: "",
        cardExpiry: "",
        cardCvv: "",
        cardName: "",
      });
    }
  });
});

describe("helpers de tarjeta", () => {
  it("AC-3: isValidLuhn", () => {
    expect(isValidLuhn("4242424242424242")).toBe(true);
    expect(isValidLuhn("4111111111111111")).toBe(true);
    expect(isValidLuhn("4242424242424241")).toBe(false);
  });

  it("AC-3: isValidCardExpiry con now explícito", () => {
    const now = new Date("2026-09-29T12:00:00-05:00");
    expect(isValidCardExpiry("09/26", now)).toBe(true);
    expect(isValidCardExpiry("12/30", now)).toBe(true);
    expect(isValidCardExpiry("08/26", now)).toBe(false);
    expect(isValidCardExpiry("13/27", now)).toBe(false);
    expect(isValidCardExpiry("0927", now)).toBe(false);
  });

  it("AC-3: formatCardNumber", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("4242-42a")).toBe("4242 42");
    expect(formatCardNumber("1".repeat(25))).toBe("1111 1111 1111 1111 111");
    expect(formatCardNumber("")).toBe("");
  });

  it("AC-3: formatCardExpiry", () => {
    expect(formatCardExpiry("0927")).toBe("09/27");
    expect(formatCardExpiry("0")).toBe("0");
    expect(formatCardExpiry("12/345")).toBe("12/34");
  });
});

describe("getCheckoutErrors", () => {
  it("AC-4: con valores vacíos devuelve todos los campos inválidos a la vez", () => {
    expect(Object.keys(getCheckoutErrors(EMPTY_CHECKOUT_VALUES)).sort()).toEqual(
      [
        "fullName",
        "email",
        "documentNumber",
        "phone",
        "cardNumber",
        "cardExpiry",
        "cardCvv",
        "cardName",
        "acceptedTerms",
      ].sort(),
    );
  });

  it("AC-4: con yape omite los errores de tarjeta", () => {
    expect(
      Object.keys(getCheckoutErrors({ ...EMPTY_CHECKOUT_VALUES, paymentMethod: "yape" })).sort(),
    ).toEqual(["fullName", "email", "documentNumber", "phone", "acceptedTerms"].sort());
  });

  it("AC-4: con valores válidos devuelve {}", () => {
    expect(getCheckoutErrors(validValues)).toEqual({});
  });
});
