import type { OrganizerEvent } from "@/modules/organizer/schemas/organizer-event.schema";

export const ORGANIZER_EVENTS: ReadonlyArray<OrganizerEvent> = [
  {
    id: "org-evt-1",
    title: "Festival Vive Latino Lima",
    categorySlug: "festivales",
    description:
      "Dos días de rock, pop y música alternativa latinoamericana con más de 20 bandas en tres escenarios.",
    venueName: "Estadio San Marcos",
    city: "Lima",
    startDate: "2026-10-05T16:00:00-05:00",
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    tiers: [
      { id: "org-evt-1-general", name: "General", price: 120, capacity: 6000, sold: 5800 },
      { id: "org-evt-1-vip", name: "VIP", price: 250, capacity: 2000, sold: 1620 },
    ],
    createdAt: "2026-07-10T15:00:00.000Z",
  },
  {
    id: "org-evt-2",
    title: "Romeo y Julieta — Obra de Teatro",
    categorySlug: "teatro",
    description:
      "Una puesta en escena contemporánea del clásico de Shakespeare, con elenco arequipeño y música en vivo.",
    venueName: "Teatro Municipal de Arequipa",
    city: "Arequipa",
    startDate: "2026-11-02T20:00:00-05:00",
    imageUrl:
      "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    tiers: [
      { id: "org-evt-2-platea", name: "Platea", price: 60, capacity: 300, sold: 240 },
      { id: "org-evt-2-mezanine", name: "Mezanine", price: 45, capacity: 120, sold: 72 },
    ],
    createdAt: "2026-08-02T16:30:00.000Z",
  },
  {
    id: "org-evt-3",
    title: "Circo de las Estrellas",
    categorySlug: "familiar",
    description:
      "Acróbatas, malabaristas y payasos en un espectáculo para toda la familia bajo la gran carpa.",
    venueName: "Parque de la Exposición",
    city: "Lima",
    startDate: "2026-11-22T17:00:00-05:00",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
    status: "published",
    tiers: [{ id: "org-evt-3-general", name: "General", price: 45, capacity: 1200, sold: 414 }],
    createdAt: "2026-08-20T14:00:00.000Z",
  },
  {
    id: "org-evt-4",
    title: "Feria Familiar de Verano",
    categorySlug: "familiar",
    description:
      "Juegos, talleres para niños, comida regional y música en vivo para empezar el verano en familia.",
    venueName: "Parque Selva Alegre",
    city: "Arequipa",
    startDate: "2026-12-01T10:00:00-05:00",
    imageUrl: null,
    status: "draft",
    tiers: [{ id: "org-evt-4-general", name: "General", price: 40, capacity: 1500, sold: 0 }],
    createdAt: "2026-09-18T19:45:00.000Z",
  },
];
