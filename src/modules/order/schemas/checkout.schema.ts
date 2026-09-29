import { z } from "zod";

import {
  getEmailError,
  getFieldErrors,
  getPersonNameError,
  normalizeEmail,
  type FieldErrors,
} from "@/lib/validation";

export const documentTypeSchema = z.enum(["DNI", "CE", "PASSPORT"]);
export type DocumentType = z.infer<typeof documentTypeSchema>;
export const DOCUMENT_TYPE_OPTIONS: ReadonlyArray<{ value: DocumentType; label: string }> = [
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "CE" },
  { value: "PASSPORT", label: "Pasaporte" },
];

export const paymentMethodSchema = z.enum(["card", "yape", "cash"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export const PAYMENT_METHOD_OPTIONS: ReadonlyArray<{
  value: PaymentMethod;
  label: string;
  mobileLabel: string;
}> = [
  { value: "card", label: "Tarjeta", mobileLabel: "Tarjeta de crédito o débito" },
  { value: "yape", label: "Yape", mobileLabel: "Yape" },
  { value: "cash", label: "PagoEfectivo", mobileLabel: "PagoEfectivo" },
];

export type CheckoutFormValues = {
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  phone: string;
  paymentMethod: PaymentMethod;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardName: string;
  acceptedTerms: boolean;
};
export type CheckoutData = Omit<CheckoutFormValues, "acceptedTerms"> & { acceptedTerms: true };

export type CheckoutField = keyof CheckoutFormValues;
export const CHECKOUT_FIELDS: ReadonlyArray<CheckoutField> = [
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
];

export const EMPTY_CHECKOUT_VALUES: CheckoutFormValues = {
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
};

export type CheckoutErrors = FieldErrors<CheckoutField>;

const PHONE_PATTERN = /^(?:\+?51)?(9\d{8})$/;
const CARD_EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/(\d{2})$/;

const DOCUMENT_RULES: Record<DocumentType, { pattern: RegExp; message: string }> = {
  DNI: { pattern: /^\d{8}$/, message: "El DNI debe tener 8 dígitos." },
  CE: { pattern: /^\d{9}$/, message: "El carné de extranjería debe tener 9 dígitos." },
  PASSPORT: {
    pattern: /^[A-Z0-9]{6,12}$/,
    message: "El pasaporte debe tener entre 6 y 12 letras o números.",
  },
};

const stripSeparators = (value: string) => value.replace(/[\s-]/g, "");

function normalizeDocumentNumber(type: DocumentType, value: string): string {
  const trimmed = value.trim();
  return type === "PASSPORT" ? trimmed.toUpperCase() : trimmed;
}

function normalizePhone(value: string): string {
  const compact = stripSeparators(value);
  return compact.match(PHONE_PATTERN)?.[1] ?? compact;
}

export function isValidLuhn(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function isValidCardExpiry(value: string, now: Date = new Date()): boolean {
  const match = value.match(CARD_EXPIRY_PATTERN);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  return endOfMonth.getTime() >= now.getTime();
}

export function formatCardNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 19);
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

export function formatCardExpiry(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

type Rule = (values: CheckoutFormValues) => string | null;

const rules: Partial<Record<CheckoutField, Rule>> = {
  fullName: ({ fullName }) => getPersonNameError(fullName),
  email: ({ email }) => getEmailError(email),
  documentNumber: ({ documentType, documentNumber }) => {
    const value = normalizeDocumentNumber(documentType, documentNumber);
    if (!value) return "Ingresa tu número de documento.";
    const rule = DOCUMENT_RULES[documentType];
    return rule.pattern.test(value) ? null : rule.message;
  },
  phone: ({ phone }) => {
    if (!phone.trim()) return "Ingresa tu número de celular.";
    return PHONE_PATTERN.test(stripSeparators(phone))
      ? null
      : "Ingresa un celular peruano de 9 dígitos que empiece con 9.";
  },
  cardNumber: ({ paymentMethod, cardNumber }) => {
    if (paymentMethod !== "card") return null;
    const value = stripSeparators(cardNumber);
    if (!value) return "Ingresa el número de tarjeta.";
    return /^\d{13,19}$/.test(value) && isValidLuhn(value)
      ? null
      : "El número de tarjeta no es válido.";
  },
  cardExpiry: ({ paymentMethod, cardExpiry }) => {
    if (paymentMethod !== "card") return null;
    const value = cardExpiry.trim();
    if (!value) return "Ingresa la fecha de vencimiento.";
    if (!CARD_EXPIRY_PATTERN.test(value)) return "Usa el formato MM/AA.";
    return isValidCardExpiry(value, new Date()) ? null : "La tarjeta está vencida.";
  },
  cardCvv: ({ paymentMethod, cardCvv }) => {
    if (paymentMethod !== "card") return null;
    const value = cardCvv.trim();
    if (!value) return "Ingresa el CVV.";
    return /^\d{3,4}$/.test(value) ? null : "El CVV tiene 3 o 4 dígitos.";
  },
  cardName: ({ paymentMethod, cardName }) => {
    if (paymentMethod !== "card") return null;
    const length = cardName.trim().length;
    return length >= 2 && length <= 26 ? null : "Ingresa el nombre como aparece en la tarjeta.";
  },
  acceptedTerms: ({ acceptedTerms }) =>
    acceptedTerms === true ? null : "Debes aceptar los términos y condiciones.",
};

function normalize(values: CheckoutFormValues): CheckoutData {
  const isCard = values.paymentMethod === "card";
  return {
    fullName: values.fullName.trim(),
    email: normalizeEmail(values.email),
    documentType: values.documentType,
    documentNumber: normalizeDocumentNumber(values.documentType, values.documentNumber),
    phone: normalizePhone(values.phone),
    paymentMethod: values.paymentMethod,
    cardNumber: isCard ? stripSeparators(values.cardNumber) : "",
    cardExpiry: isCard ? values.cardExpiry.trim() : "",
    cardCvv: isCard ? values.cardCvv.trim() : "",
    cardName: isCard ? values.cardName.trim() : "",
    acceptedTerms: true,
  };
}

// Forma permisiva + un único superRefine: en zod 4 los refinamientos no corren si la forma
// ya falla, y AC-4 exige reportar todos los campos inválidos a la vez.
export const checkoutSchema: z.ZodType<CheckoutData, CheckoutFormValues> = z
  .object({
    fullName: z.string(),
    email: z.string(),
    documentType: documentTypeSchema,
    documentNumber: z.string(),
    phone: z.string(),
    paymentMethod: paymentMethodSchema,
    cardNumber: z.string(),
    cardExpiry: z.string(),
    cardCvv: z.string(),
    cardName: z.string(),
    acceptedTerms: z.boolean(),
  })
  .superRefine((values, ctx) => {
    for (const field of CHECKOUT_FIELDS) {
      const message = rules[field]?.(values);
      if (message) ctx.addIssue({ code: "custom", path: [field], message });
    }
  })
  .transform(normalize);

export function getCheckoutErrors(values: CheckoutFormValues): CheckoutErrors {
  return getFieldErrors<CheckoutField>(checkoutSchema, values);
}
