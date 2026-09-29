import type { SessionUser } from "@/modules/auth/schemas/auth.schema";

export type AuthAccount = SessionUser & { password: string };

export const DEMO_CREDENTIALS = { email: "demo@ticketera.pe", password: "Demo1234" } as const;

export const DEMO_ACCOUNTS: ReadonlyArray<AuthAccount> = [
  {
    id: "usr-demo",
    name: "Ana Torres",
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
  },
];
