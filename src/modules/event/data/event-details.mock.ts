import type { Event, EventDetail } from "@/modules/event/schemas/event.schema";

export type EventDetailExtra = Omit<EventDetail, keyof Event>;

export const eventDetails: Record<string, EventDetailExtra> = {
  "noches-de-rock-lima": {
    description:
      "Las bandas más potentes del rock nacional e internacional se reúnen en una sola noche en el Estadio Nacional. Más de cuatro horas de música en vivo, pantallas gigantes y un sonido de primer nivel para vivir el rock como se merece.",
    doorsOpenAt: "2026-11-14T18:30:00-05:00",
    minAge: 18,
    venueAddress: "Av. José Díaz s/n, Cercado de Lima",
    tiers: [
      { id: "general", name: "General", price: 120, color: "#6366F1", status: "available" },
      { id: "preferencial", name: "Preferencial", price: 220, color: "#0EA5E9", status: "available" },
      { id: "vip", name: "VIP", price: 380, color: "#F59E0B", status: "last_tickets" },
      { id: "palco", name: "Palco", price: 650, color: "#EF4444", status: "sold_out" },
    ],
  },
  "festival-sonido-andino": {
    description:
      "Un festival al aire libre frente al mar que mezcla música andina, fusión y electrónica. Artistas de todo el país, feria gastronómica y zona de artesanías durante toda la jornada.",
    doorsOpenAt: "2026-12-05T15:00:00-05:00",
    minAge: null,
    venueAddress: "Circuito de Playas de la Costa Verde, Miraflores",
    tiers: [
      { id: "general", name: "General", price: 95, color: "#22C55E", status: "last_tickets" },
      { id: "preferencial", name: "Preferencial", price: 160, color: "#0EA5E9", status: "last_tickets" },
      { id: "vip", name: "VIP", price: 290, color: "#F59E0B", status: "sold_out" },
    ],
  },
  "romeo-y-julieta-teatro-municipal": {
    description:
      "La tragedia de Shakespeare en una puesta en escena contemporánea, con un elenco de primer nivel y música original interpretada en vivo por una orquesta de cámara.",
    doorsOpenAt: "2026-10-22T19:15:00-05:00",
    minAge: 12,
    venueAddress: "Jr. Ica 377, Cercado de Lima",
    tiers: [
      { id: "galeria", name: "Galería", price: 60, color: "#A855F7", status: "available" },
      { id: "platea", name: "Platea", price: 120, color: "#EC4899", status: "available" },
      { id: "palco", name: "Palco", price: 180, color: "#F59E0B", status: "available" },
    ],
  },
  "clasico-del-futbol-peruano": {
    description:
      "El partido más esperado del año. Vive la pasión del clásico del fútbol peruano en el Estadio Monumental, con la hinchada de ambos equipos y un ambiente único.",
    doorsOpenAt: "2026-11-01T12:30:00-05:00",
    minAge: null,
    venueAddress: "Av. Javier Prado Este 7900, Ate",
    tiers: [
      { id: "norte", name: "Popular Norte", price: 45, color: "#22C55E", status: "sold_out" },
      { id: "oriente", name: "Oriente", price: 90, color: "#0EA5E9", status: "sold_out" },
      { id: "occidente", name: "Occidente", price: 150, color: "#F59E0B", status: "sold_out" },
    ],
  },
  "noche-de-stand-up-cusco": {
    description:
      "Una noche de risas con los mejores comediantes de stand-up del país. Rutinas nuevas, improvisación y humor sin filtro en el corazón de Cusco.",
    doorsOpenAt: "2026-10-30T20:00:00-05:00",
    minAge: 18,
    venueAddress: "Av. El Sol 103, Cusco",
    tiers: [
      { id: "general", name: "General", price: 40, color: "#EAB308", status: "available" },
      { id: "preferencial", name: "Preferencial", price: 70, color: "#F97316", status: "last_tickets" },
      { id: "mesa-vip", name: "Mesa VIP", price: 120, color: "#EF4444", status: "available" },
    ],
  },
  "maraton-de-cine-independiente": {
    description:
      "Una maratón de cortos y largometrajes del cine independiente latinoamericano, con conversatorios con directores entre funciones y una selección curada por críticos locales.",
    doorsOpenAt: "2026-11-08T18:15:00-05:00",
    minAge: null,
    venueAddress: "Calle Santa Catalina 210, Cercado de Arequipa",
    tiers: [
      { id: "funcion", name: "Función única", price: 25, color: "#8B5CF6", status: "available" },
      { id: "pase", name: "Pase completo", price: 60, color: "#6366F1", status: "available" },
      { id: "pase-meet", name: "Pase + Meet & Greet", price: 90, color: "#EC4899", status: "available" },
    ],
  },
  "electro-fest-trujillo": {
    description:
      "El festival de música electrónica más grande del norte del país. DJs nacionales e internacionales, escenario 360° y un show de luces que transforma la Plaza de Armas.",
    doorsOpenAt: "2026-12-20T17:00:00-05:00",
    minAge: 18,
    venueAddress: "Plaza de Armas de Trujillo, Centro Histórico",
    tiers: [
      { id: "early-bird", name: "Early Bird", price: 60, color: "#14B8A6", status: "sold_out" },
      { id: "general", name: "General", price: 85, color: "#6366F1", status: "last_tickets" },
      { id: "vip", name: "VIP", price: 180, color: "#F59E0B", status: "available" },
      { id: "backstage", name: "Backstage", price: 350, color: "#EF4444", status: "last_tickets" },
    ],
  },
  "sinfonica-nacional-en-vivo": {
    description:
      "La Orquesta Sinfónica Nacional interpreta un programa con obras de Beethoven, Dvořák y compositores peruanos contemporáneos, en la sala principal del Gran Teatro Nacional.",
    doorsOpenAt: "2026-11-27T18:45:00-05:00",
    minAge: null,
    venueAddress: "Av. Javier Prado Este 2225, San Borja",
    tiers: [
      { id: "galeria", name: "Galería", price: 70, color: "#0EA5E9", status: "available" },
      { id: "platea", name: "Platea", price: 140, color: "#6366F1", status: "available" },
      { id: "palco", name: "Palco", price: 250, color: "#F59E0B", status: "last_tickets" },
    ],
  },
  "final-voley-liga-nacional": {
    description:
      "La gran final de la Liga Nacional de Vóley femenino. Los dos mejores equipos de la temporada se enfrentan por el título en el Coliseo Eduardo Dibós.",
    doorsOpenAt: "2026-10-18T16:30:00-05:00",
    minAge: null,
    venueAddress: "Av. Angamos Este 2681, San Borja",
    tiers: [
      { id: "general", name: "General", price: 35, color: "#22C55E", status: "available" },
      { id: "preferencial", name: "Preferencial", price: 80, color: "#0EA5E9", status: "available" },
      { id: "cancha", name: "Cancha", price: 150, color: "#F59E0B", status: "last_tickets" },
    ],
  },
};
