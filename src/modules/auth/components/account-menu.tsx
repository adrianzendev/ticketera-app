"use client";

import { CircleUserRound, LayoutDashboard, LogOut, Ticket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/modules/auth/schemas/auth.schema";
import { ORGANIZER_HOME_HREF } from "@/modules/organizer/components/organizer-shell";

const itemClassName =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

export function AccountMenu({
  user,
  onLogout,
  className,
}: {
  user: SessionUser;
  onLogout: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  function handleLogout() {
    setOpen(false);
    onLogout();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label="Mi cuenta"
            className={cn(
              "size-11 rounded-full border-[1.5px] border-zinc-300 bg-white text-foreground",
              className,
            )}
          />
        }
      >
        <CircleUserRound className="size-[22px]" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-72 gap-1 p-2">
        <div className="flex flex-col gap-0.5 px-3 py-2">
          <p className="font-semibold">{user.name}</p>
          <p className="break-all text-muted-foreground">{user.email}</p>
        </div>
        <Separator className="my-1" />
        <Link href="/mis-entradas" onClick={() => setOpen(false)} className={itemClassName}>
          <Ticket className="size-[18px]" aria-hidden="true" />
          Mis entradas
        </Link>
        <Link href={ORGANIZER_HOME_HREF} onClick={() => setOpen(false)} className={itemClassName}>
          <LayoutDashboard className="size-[18px]" aria-hidden="true" />
          Panel de organizador
        </Link>
        <button type="button" onClick={handleLogout} className={itemClassName}>
          <LogOut className="size-[18px]" aria-hidden="true" />
          Cerrar sesión
        </button>
      </PopoverContent>
    </Popover>
  );
}
