export const EVENT_TIME_ZONE = "America/Lima";

const longDateFormatter = new Intl.DateTimeFormat("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: EVENT_TIME_ZONE,
});

const shortDateFormatter = new Intl.DateTimeFormat("es-PE", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: EVENT_TIME_ZONE,
});

// es-PE produce "sábado, 14 de noviembre" y "sáb, 14 nov."; el diseño va sin coma ni punto.
function formatWithoutPunctuation(formatter: Intl.DateTimeFormat, iso: string) {
  return formatter.format(new Date(iso)).replace(/[,.]/g, "");
}

export function formatEventDateLong(iso: string): string {
  return formatWithoutPunctuation(longDateFormatter, iso);
}

export function formatEventDateShort(iso: string): string {
  return formatWithoutPunctuation(shortDateFormatter, iso);
}
