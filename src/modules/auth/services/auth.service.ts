import { DEMO_ACCOUNTS, type AuthAccount } from "@/modules/auth/data/users.mock";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
  type SessionUser,
} from "@/modules/auth/schemas/auth.schema";

export const SIMULATED_AUTH_DELAY_MS = 800;

export type AuthErrorCode = "INVALID_CREDENTIALS" | "EMAIL_TAKEN";

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode | "UNKNOWN", string> = {
  INVALID_CREDENTIALS: "Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.",
  EMAIL_TAKEN: "Ya existe una cuenta con este correo. Inicia sesión.",
  UNKNOWN: "No pudimos completar la operación. Inténtalo de nuevo.",
};

function isAuthErrorCode(value: string): value is AuthErrorCode {
  return value === "INVALID_CREDENTIALS" || value === "EMAIL_TAKEN";
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && isAuthErrorCode(error.message)) {
    return AUTH_ERROR_MESSAGES[error.message];
  }
  return AUTH_ERROR_MESSAGES.UNKNOWN;
}

export type AuthService = {
  login(values: LoginFormValues): Promise<SessionUser>;
  register(values: RegisterFormValues): Promise<SessionUser>;
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const toSessionUser = ({ id, name, email }: AuthAccount): SessionUser => ({ id, name, email });

export function createAuthService({
  accounts = DEMO_ACCOUNTS,
  delayMs = SIMULATED_AUTH_DELAY_MS,
  generateId = () => `usr-${crypto.randomUUID()}`,
}: {
  accounts?: ReadonlyArray<AuthAccount>;
  delayMs?: number;
  generateId?: () => string;
} = {}): AuthService {
  const accountsByEmail = new Map(
    accounts.map((account) => [account.email.toLowerCase(), { ...account }]),
  );

  return {
    async login(values) {
      const { email, password } = loginSchema.parse(values);
      await wait(delayMs);
      const account = accountsByEmail.get(email);
      // Mismo error para correo inexistente y contraseña incorrecta: no revela qué correos existen.
      if (!account || account.password !== password) throw new Error("INVALID_CREDENTIALS");
      return toSessionUser(account);
    },

    async register(values) {
      const { fullName, email, password } = registerSchema.parse(values);
      await wait(delayMs);
      if (accountsByEmail.has(email)) throw new Error("EMAIL_TAKEN");
      const account: AuthAccount = { id: generateId(), name: fullName, email, password };
      accountsByEmail.set(email, account);
      return toSessionUser(account);
    },
  };
}

export const authService = createAuthService();

export const DEFAULT_REDIRECT = "/mis-entradas";

const REDIRECT_BASE = "http://local.test";
// El parser de URL descarta tabs y saltos de línea: "/\t/evil.com" terminaría en "//evil.com".
const UNSAFE_REDIRECT_CHARS = /[\u0000-\u001F\u007F\s]/;

function isSameOrigin(value: string): boolean {
  try {
    return new URL(value, REDIRECT_BASE).origin === REDIRECT_BASE;
  } catch {
    return false;
  }
}

export function getSafeRedirect(
  value: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT,
): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\") ||
    value.includes("\\") ||
    UNSAFE_REDIRECT_CHARS.test(value) ||
    value.startsWith("/ingresar") ||
    !isSameOrigin(value)
  ) {
    return fallback;
  }
  return value;
}
