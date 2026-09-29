import { formatEventDayMonth } from "@/lib/date";
import { categories } from "@/modules/event/data/categories.mock";

import {
  parseTierCapacity,
  parseTierPrice,
  toStartDate,
  type EventFormData,
  type EventFormValues,
} from "../schemas/event-form.schema";
import type { OrganizerEvent, OrganizerEventStatus } from "../schemas/organizer-event.schema";

export const COVER_IMAGE_TYPES: ReadonlyArray<string> = ["image/jpeg", "image/png"];
export const COVER_IMAGE_MAX_BYTES = 1_048_576;

export function getCoverImageError(file: { type: string; size: number }): string | null {
  if (!COVER_IMAGE_TYPES.includes(file.type)) return "Sube una imagen JPG o PNG.";
  if (file.size > COVER_IMAGE_MAX_BYTES) return "La imagen debe pesar como máximo 1 MB.";
  return null;
}

export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

export type EventFormPreview = {
  categoryName: string;
  title: string | null;
  place: string | null;
  day: string | null;
  month: string | null;
  minPrice: number | null;
  capacity: number;
};

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export function getEventFormPreview(values: EventFormValues): EventFormPreview {
  const categoryName =
    categories.find((category) => category.slug === values.categorySlug)?.name ?? "";
  const title = values.name.trim() || null;
  const placeParts = [values.venueName.trim(), values.city.trim()].filter(Boolean);
  // Mediodía de Lima: la insignia muestra el día elegido sin depender de la hora ingresada.
  const middayDate = toStartDate(values.date, "12:00");
  const dayMonth = middayDate ? formatEventDayMonth(middayDate) : null;
  const prices = values.tiers.map((tier) => parseTierPrice(tier.price)).filter(isNotNull);
  const capacities = values.tiers
    .map((tier) => parseTierCapacity(tier.capacity))
    .filter(isNotNull);

  return {
    categoryName,
    title,
    place: placeParts.length > 0 ? placeParts.join(" · ") : null,
    day: dayMonth?.day ?? null,
    month: dayMonth?.month ?? null,
    minPrice: prices.length > 0 ? Math.min(...prices) : null,
    capacity: capacities.reduce((total, capacity) => total + capacity, 0),
  };
}

export function buildOrganizerEvent(
  data: EventFormData,
  status: OrganizerEventStatus,
  {
    now = new Date(),
    generateId = () => `org-${crypto.randomUUID()}`,
  }: { now?: Date; generateId?: () => string } = {},
): OrganizerEvent {
  const id = generateId();
  return {
    id,
    title: data.title,
    categorySlug: data.categorySlug,
    description: data.description,
    venueName: data.venueName,
    city: data.city,
    startDate: data.startDate,
    imageUrl: data.imageUrl,
    status,
    tiers: data.tiers.map((tier, index) => ({
      id: `${id}-tier-${index + 1}`,
      name: tier.name,
      price: tier.price,
      capacity: tier.capacity,
      sold: 0,
    })),
    createdAt: now.toISOString(),
  };
}
