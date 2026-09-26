import type { Category } from "@/modules/event/schemas/event.schema";

export const categories: Category[] = [
  { id: "cat-1", slug: "conciertos", name: "Conciertos", icon: "Music", colorClass: "bg-indigo-50 text-indigo-700" },
  { id: "cat-2", slug: "deportes", name: "Deportes", icon: "Volleyball", colorClass: "bg-green-50 text-green-700" },
  { id: "cat-3", slug: "teatro", name: "Teatro", icon: "Drama", colorClass: "bg-rose-50 text-rose-700" },
  { id: "cat-4", slug: "festivales", name: "Festivales", icon: "PartyPopper", colorClass: "bg-orange-50 text-orange-700" },
  { id: "cat-5", slug: "familiar", name: "Familiar", icon: "Users", colorClass: "bg-cyan-50 text-cyan-700" },
  { id: "cat-6", slug: "cine", name: "Cine", icon: "Clapperboard", colorClass: "bg-violet-50 text-violet-700" },
  { id: "cat-7", slug: "comedia", name: "Comedia", icon: "Mic2", colorClass: "bg-yellow-50 text-yellow-700" },
  { id: "cat-8", slug: "arte", name: "Arte y Exposiciones", icon: "Palette", colorClass: "bg-fuchsia-50 text-fuchsia-700" },
];
