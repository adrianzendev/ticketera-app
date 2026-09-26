"use client";

import Link from "next/link";
import { Menu, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Eventos", href: "#eventos" },
  { label: "Categorías", href: "#categorias" },
  { label: "Cómo funciona", href: "#como-funciona" },
];

export function SiteNavbar() {
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
          <Button variant="ghost" nativeButton={false} render={<Link href="#" />}>
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
        </div>

        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
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
    </header>
  );
}
