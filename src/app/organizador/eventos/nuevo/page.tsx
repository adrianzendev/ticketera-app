import type { Metadata } from "next";

import { CreateEventView } from "@/modules/organizer/components/create-event-view";

export const metadata: Metadata = {
  title: "Crear evento | Ticketera",
  robots: { index: false },
};

export default function CreateEventPage() {
  return <CreateEventView />;
}
