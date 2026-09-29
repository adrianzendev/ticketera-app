"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { EventForm } from "./event-form";
import { CREATE_EVENT_HREF, ORGANIZER_HOME_HREF, OrganizerShell } from "./organizer-shell";

function CreateEventMobileHeader() {
  return (
    <header className="flex h-[60px] items-center gap-1 border-b border-zinc-100 bg-white pr-3 pl-1.5">
      <Link
        href={ORGANIZER_HOME_HREF}
        aria-label="Volver al panel"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-foreground outline-none hover:bg-zinc-100 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeft className="size-[22px]" aria-hidden="true" />
      </Link>
      <h1 className="text-lg font-semibold">Crear evento</h1>
    </header>
  );
}

export function CreateEventView() {
  return (
    <OrganizerShell
      active="events"
      loginRedirect={CREATE_EVENT_HREF}
      mobileHeader={<CreateEventMobileHeader />}
    >
      <EventForm />
    </OrganizerShell>
  );
}
