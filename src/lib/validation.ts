import { z } from "zod";

export const PERSON_NAME_MAX_LENGTH = 80;
const PERSON_NAME_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$/;

const emailFormatSchema = z.email();

export function getPersonNameError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Ingresa tu nombre completo.";
  const words = trimmed.split(/\s+/);
  if (
    trimmed.length > PERSON_NAME_MAX_LENGTH ||
    words.length < 2 ||
    !PERSON_NAME_PATTERN.test(trimmed)
  ) {
    return "Ingresa tu nombre y apellido, solo con letras.";
  }
  return null;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function getEmailError(value: string): string | null {
  if (!value.trim()) return "Ingresa tu correo electrónico.";
  if (!emailFormatSchema.safeParse(normalizeEmail(value)).success) {
    return "Ingresa un correo válido, por ejemplo tu@email.com.";
  }
  return null;
}

export type FieldErrors<F extends string> = Partial<Record<F, string>>;

export function getFieldErrors<F extends string>(
  schema: z.ZodType,
  values: unknown,
): FieldErrors<F> {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const errors: FieldErrors<F> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as F | undefined;
    if (field !== undefined && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
