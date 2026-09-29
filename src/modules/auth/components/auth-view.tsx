"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { AuthBrandPanel } from "@/modules/auth/components/auth-brand-panel";
import { LoginForm } from "@/modules/auth/components/login-form";
import { RegisterForm } from "@/modules/auth/components/register-form";
import { useSession } from "@/modules/auth/hooks/use-session";

export type AuthMode = "login" | "register";

const MODES: ReadonlyArray<{ value: AuthMode; label: string }> = [
  { value: "login", label: "Iniciar sesión" },
  { value: "register", label: "Crear cuenta" },
];

function ModeSelector({ mode, onChange }: { mode: AuthMode; onChange: (mode: AuthMode) => void }) {
  return (
    <div role="group" aria-label="Elige cómo ingresar" className="grid grid-cols-2 gap-1 rounded-2xl bg-zinc-100 p-1">
      {MODES.map((option) => {
        const active = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-11 rounded-xl text-[15px] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "bg-white font-semibold shadow-[0_2px_8px_-4px_rgba(24,24,27,0.3)]"
                : "bg-transparent font-medium hover:bg-zinc-200/60",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function AuthView({ redirectTo }: { redirectTo: string }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const { status } = useSession();
  const router = useRouter();
  const redirected = useRef(false);

  const redirect = useCallback(() => {
    if (redirected.current) return;
    redirected.current = true;
    router.replace(redirectTo);
  }, [router, redirectTo]);

  useEffect(() => {
    if (status === "authenticated") redirect();
  }, [status, redirect]);

  const switchTo = (next: AuthMode) => () => setMode(next);

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:grid lg:grid-cols-2 xl:grid-cols-[640px_minmax(0,1fr)]">
      <AuthBrandPanel />

      <main className="flex flex-1 flex-col px-4 pt-6 pb-8 lg:items-center lg:justify-center lg:p-10">
        {status === "anonymous" ? (
          <div className="flex w-full flex-col gap-6 lg:max-w-[440px] lg:gap-7">
            <ModeSelector mode={mode} onChange={setMode} />
            {mode === "login" ? (
              <LoginForm onSwitchMode={switchTo("register")} onSuccess={redirect} />
            ) : (
              <RegisterForm onSwitchMode={switchTo("login")} onSuccess={redirect} />
            )}
          </div>
        ) : (
          // Sin formulario mientras se conoce la sesión o se redirige, para que no parpadee.
          <div aria-busy="true" className="w-full lg:max-w-[440px]">
            <span className="sr-only">Cargando…</span>
          </div>
        )}
      </main>
    </div>
  );
}
