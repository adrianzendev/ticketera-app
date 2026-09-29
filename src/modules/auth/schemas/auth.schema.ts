import { z } from "zod";

import { getEmailError, getPersonNameError, normalizeEmail } from "@/lib/validation";

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export type LoginFormValues = { email: string; password: string };
export type LoginData = LoginFormValues;
export type LoginField = keyof LoginFormValues;
export const LOGIN_FIELDS: ReadonlyArray<LoginField> = ["email", "password"];
export const EMPTY_LOGIN_VALUES: LoginFormValues = { email: "", password: "" };

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
};
export type RegisterData = Omit<RegisterFormValues, "acceptedTerms"> & { acceptedTerms: true };
export type RegisterField = keyof RegisterFormValues;
export const REGISTER_FIELDS: ReadonlyArray<RegisterField> = [
  "fullName",
  "email",
  "password",
  "acceptedTerms",
];
export const EMPTY_REGISTER_VALUES: RegisterFormValues = {
  fullName: "",
  email: "",
  password: "",
  acceptedTerms: false,
};

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
export const PASSWORD_HINT = "Mínimo 8 caracteres, con al menos una letra y un número.";

const PASSWORD_LETTER_PATTERN = /[A-Za-zÁÉÍÓÚáéíóúÑñÜü]/;
const PASSWORD_DIGIT_PATTERN = /\d/;

export function isValidPassword(value: string): boolean {
  return (
    value.length >= PASSWORD_MIN_LENGTH &&
    value.length <= PASSWORD_MAX_LENGTH &&
    PASSWORD_LETTER_PATTERN.test(value) &&
    PASSWORD_DIGIT_PATTERN.test(value)
  );
}

type Rules<V, F extends keyof V> = Record<F, (values: V) => string | null>;

function addRuleIssues<V, F extends keyof V & string>(
  fields: ReadonlyArray<F>,
  rules: Rules<V, F>,
  values: V,
  ctx: z.RefinementCtx,
) {
  for (const field of fields) {
    const message = rules[field](values);
    if (message) ctx.addIssue({ code: "custom", path: [field], message });
  }
}

// En el login la contraseña no tiene reglas de formato: solo puede fallar como credencial.
const loginRules: Rules<LoginFormValues, LoginField> = {
  email: ({ email }) => getEmailError(email),
  password: ({ password }) => (password === "" ? "Ingresa tu contraseña." : null),
};

// Forma permisiva + un único superRefine: en zod 4 los refinamientos no corren si la forma
// ya falla, y los formularios deben reportar todos los campos inválidos a la vez.
export const loginSchema: z.ZodType<LoginData, LoginFormValues> = z
  .object({ email: z.string(), password: z.string() })
  .superRefine((values, ctx) => addRuleIssues(LOGIN_FIELDS, loginRules, values, ctx))
  .transform(({ email, password }) => ({ email: normalizeEmail(email), password }));

const registerRules: Rules<RegisterFormValues, RegisterField> = {
  fullName: ({ fullName }) => getPersonNameError(fullName),
  email: ({ email }) => getEmailError(email),
  password: ({ password }) => {
    if (password === "") return "Crea una contraseña.";
    return isValidPassword(password)
      ? null
      : "Usa al menos 8 caracteres, con una letra y un número.";
  },
  acceptedTerms: ({ acceptedTerms }) =>
    acceptedTerms === true ? null : "Debes aceptar los términos y condiciones.",
};

export const registerSchema: z.ZodType<RegisterData, RegisterFormValues> = z
  .object({
    fullName: z.string(),
    email: z.string(),
    password: z.string(),
    acceptedTerms: z.boolean(),
  })
  .superRefine((values, ctx) => addRuleIssues(REGISTER_FIELDS, registerRules, values, ctx))
  .transform(({ fullName, email, password }) => ({
    fullName: fullName.trim(),
    email: normalizeEmail(email),
    password,
    acceptedTerms: true as const,
  }));
