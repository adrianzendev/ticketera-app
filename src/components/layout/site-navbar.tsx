"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogIn, LogOut, Menu, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AccountMenu } from "@/modules/auth/components/account-menu";
import { useSession } from "@/modules/auth/hooks/use-session";
import { useAuthStore } from "@/modules/auth/store/auth.store";

const navLinks = [
  { label: "Eventos", href: "/eventos" },
  { label: "Categorías", href: "/#categorias" },
  { label: "Cómo funciona", href: "/#como-funciona" },
];

const MY_TICKETS_HREF = "/mis-entradas";

function getLoginHref(pathname: string) {
  return pathname.startsWith("/ingresar")
    ? "/ingresar"
    : `/ingresar?redirect=${encodeURIComponent(pathname)}`;
}

export function SiteNavbar() {
  const pathname = usePathname();
  const { status, user } = useSession();
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const loginHref = getLoginHref(pathname);

  function handleMenuLogout() {
    logout();
    setMenuOpen(false);
  }

  return (
    <header className="h-[76px] border-b border-zinc-100 bg-background">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <span className="flex size-[38px] items-center justify-center rounded-[11px] bg-primary text-primary-foreground">
            <Ticket className="size-5" />
          </span>
          <span className="text-[21px] font-bold tracking-tight">Ticketera</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-zinc-700 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {/* Mientras se lee la sesión se reserva el alto sin botones: el HTML del servidor y el primer render coinciden. */}
          {status === "loading" && <div aria-hidden="true" className="h-11" />}
          {status === "anonymous" && (
            <>
              <Button variant="ghost" nativeButton={false} render={<Link href={loginHref} />}>
                Iniciar sesión
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                className="border-[1.5px]"
                render={<Link href="#" />}
              >
                Vender entradas
              </Button>
            </>
          )}
          {status === "authenticated" && user && (
            <>
              <Link
                href={MY_TICKETS_HREF}
                aria-current={pathname === MY_TICKETS_HREF ? "page" : undefined}
                className="flex h-11 items-center gap-2 rounded-xl bg-indigo-50 px-4 text-[15px] font-semibold text-indigo-800 hover:bg-indigo-100"
              >
                <Ticket className="size-[18px]" aria-hidden="true" />
                Mis entradas
              </Link>
              <AccountMenu user={user} onLogout={logout} />
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {status === "authenticated" && user && <AccountMenu user={user} onLogout={logout} />}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu />
              <span className="sr-only">Abrir menú</span>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Ticketera</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className="justify-start"
                    nativeButton={false}
                    render={<Link href={link.href} />}
                  >
                    {link.label}
                  </Button>
                ))}

                {status === "anonymous" && (
                  <Button
                    className="mt-2 h-11 justify-start gap-2"
                    nativeButton={false}
                    render={<Link href={loginHref} />}
                  >
                    <LogIn aria-hidden="true" />
                    Iniciar sesión
                  </Button>
                )}

                {status === "authenticated" && user && (
                  <>
                    <div className="mt-2 flex flex-col gap-0.5 border-t border-zinc-100 px-2.5 pt-4 pb-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="break-all text-muted-foreground">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-11 justify-start gap-2"
                      nativeButton={false}
                      render={<Link href={MY_TICKETS_HREF} onClick={() => setMenuOpen(false)} />}
                    >
                      <Ticket aria-hidden="true" />
                      Mis entradas
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 justify-start gap-2"
                      onClick={handleMenuLogout}
                    >
                      <LogOut aria-hidden="true" />
                      Cerrar sesión
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  className="mt-2 justify-start"
                  nativeButton={false}
                  render={<Link href="#" />}
                >
                  Vender entradas
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
