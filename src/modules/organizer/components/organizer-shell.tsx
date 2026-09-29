"use client";

import {
  CalendarDays,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSession } from "@/modules/auth/hooks/use-session";
import type { SessionUser } from "@/modules/auth/schemas/auth.schema";
import { useAuthStore } from "@/modules/auth/store/auth.store";

export type OrganizerSection = "summary" | "events";

export const ORGANIZER_HOME_HREF = "/organizador";
export const ORGANIZER_EVENTS_HREF = "/organizador#mis-eventos";
export const CREATE_EVENT_HREF = "/organizador/eventos/nuevo";

const SECTION_LINKS: ReadonlyArray<{
  section: OrganizerSection;
  label: string;
  href: string;
  icon: LucideIcon;
}> = [
  { section: "summary", label: "Resumen", href: ORGANIZER_HOME_HREF, icon: LayoutDashboard },
  { section: "events", label: "Mis eventos", href: ORGANIZER_EVENTS_HREF, icon: CalendarDays },
];

const focusRingClassName = "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function OrganizerLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex w-fit items-center rounded-xl text-foreground",
        focusRingClassName,
        compact ? "gap-2" : "gap-2.5 px-2",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary text-primary-foreground",
          compact ? "size-8 rounded-[10px]" : "size-9 rounded-[11px]",
        )}
      >
        <Ticket className={compact ? "size-[17px]" : "size-[19px]"} aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-[1.15]">
        <span className={cn("font-bold tracking-tight", compact ? "text-[17px]" : "text-[19px]")}>
          Ticketera
        </span>
        <span className={cn("font-medium text-zinc-600", compact ? "text-[11px]" : "text-xs")}>
          Organizadores
        </span>
      </span>
    </Link>
  );
}

function SectionLinks({
  active,
  onNavigate,
}: {
  active: OrganizerSection;
  onNavigate?: () => void;
}) {
  return SECTION_LINKS.map(({ section, label, href, icon: Icon }) => {
    const current = section === active;
    return (
      <Link
        key={section}
        href={href}
        onClick={onNavigate}
        aria-current={current ? "page" : undefined}
        className={cn(
          "flex h-11 items-center gap-3 rounded-xl px-3 text-[15px]",
          focusRingClassName,
          current
            ? "bg-indigo-50 font-semibold text-indigo-800"
            : "font-medium text-zinc-700 hover:bg-zinc-100",
        )}
      >
        <Icon className="size-[19px]" aria-hidden="true" />
        {label}
      </Link>
    );
  });
}

function DesktopSidebar({
  active,
  user,
  onLogout,
}: {
  active: OrganizerSection;
  user: SessionUser;
  onLogout: () => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh flex-col gap-7 border-r border-zinc-200 bg-white px-4 py-6 lg:flex">
      <OrganizerLogo />
      <nav aria-label="Panel" className="flex flex-col gap-1">
        <SectionLinks active={active} />
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-zinc-100 p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-primary">
          <CircleUserRound className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{user.name}</span>
        <button
          type="button"
          aria-label="Cerrar sesión"
          onClick={onLogout}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[10px] text-zinc-600 hover:bg-zinc-100 hover:text-foreground",
            focusRingClassName,
          )}
        >
          <LogOut className="size-[18px]" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

function MobileHeader({
  active,
  user,
  onLogout,
}: {
  active: OrganizerSection;
  user: SessionUser;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    onLogout();
    setMenuOpen(false);
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-100 bg-white pr-3 pl-4">
      <OrganizerLogo compact />
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="size-11" />}>
          <Menu className="size-[22px]" aria-hidden="true" />
          <span className="sr-only">Abrir menú del panel</span>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Panel de organizador</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4">
            <nav aria-label="Panel" className="flex flex-col gap-1">
              <SectionLinks active={active} onNavigate={() => setMenuOpen(false)} />
            </nav>
            <Separator className="my-2" />
            <div className="flex flex-col gap-0.5 px-3 pb-1">
              <p className="font-semibold">{user.name}</p>
              <p className="break-all text-muted-foreground">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              className="h-11 justify-start gap-2"
              nativeButton={false}
              render={<Link href="/" onClick={() => setMenuOpen(false)} />}
            >
              <Ticket aria-hidden="true" />
              Ir a Ticketera
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" />
              Cerrar sesión
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function SignedOutState({ loginRedirect }: { loginRedirect: string }) {
  return (
    <div className="min-h-dvh bg-zinc-100">
      <header className="flex h-16 items-center border-b border-zinc-100 bg-white px-4 lg:h-[76px] lg:px-10">
        <OrganizerLogo compact />
      </header>
      <main className="px-4 py-6 lg:py-14">
        <section className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-3xl border border-zinc-200 bg-white p-6 text-center lg:p-10">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
            <Ticket className="size-7" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
            Inicia sesión para vender entradas
          </h1>
          <p className="text-[15px] leading-normal text-muted-foreground">
            Crea y gestiona tus eventos desde el panel de organizador. Ingresa con tu cuenta para
            continuar.
          </p>
          <Link
            href={`/ingresar?redirect=${encodeURIComponent(loginRedirect)}`}
            className={cn(
              "mt-2 flex min-h-11 items-center justify-center rounded-2xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90",
              focusRingClassName,
            )}
          >
            Iniciar sesión
          </Link>
        </section>
      </main>
    </div>
  );
}

export function OrganizerShell({
  active,
  loginRedirect,
  mobileHeader,
  children,
}: {
  active: OrganizerSection;
  loginRedirect: string;
  mobileHeader?: ReactNode;
  children: ReactNode;
}) {
  const { status, user } = useSession();
  const logout = useAuthStore((s) => s.logout);

  if (status === "loading") {
    return (
      <div aria-busy="true" className="min-h-dvh bg-zinc-100">
        <span className="sr-only">Cargando…</span>
      </div>
    );
  }

  if (!user) return <SignedOutState loginRedirect={loginRedirect} />;

  return (
    <div className="min-h-dvh bg-zinc-100 lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <DesktopSidebar active={active} user={user} onLogout={logout} />
      <div className="flex min-w-0 flex-col">
        <div className="lg:hidden">
          {mobileHeader ?? <MobileHeader active={active} user={user} onLogout={logout} />}
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
