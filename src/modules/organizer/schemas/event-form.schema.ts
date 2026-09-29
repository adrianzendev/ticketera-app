import { z } from "zod";

import type { FieldErrors } from "@/lib/validation";
import { categories } from "@/modules/event/data/categories.mock";

import { isAllowedOrganizerImageUrl } from "./organizer-event.schema";

export type TierField = "name" | "price" | "capacity";
export type TierFormValues = { key: string; name: string; price: string; capacity: string };
export type EventFormValues = {
  name: string;
  categorySlug: string;
  description: string;
  date: string;
  time: string;
  venueName: string;
  city: string;
  imageUrl: string | null;
  tiers: TierFormValues[];
};
export type EventField = Exclude<keyof EventFormValues, "imageUrl" | "tiers">;

export const EVENT_FIELDS: ReadonlyArray<EventField> = [
  "name",
  "categorySlug",
  "description",
  "date",
  "time",
  "venueName",
  "city",
];
export const TIER_FIELDS: ReadonlyArray<TierField> = ["name", "price", "capacity"];

export const MAX_TIERS = 10;
export const EVENT_NAME_MAX_LENGTH = 80;
export const DESCRIPTION_MIN_LENGTH = 20;
export const DESCRIPTION_MAX_LENGTH = 1000;
export const TIER_MAX_PRICE = 10000;
export const TIER_MAX_CAPACITY = 100000;

const EVENT_NAME_MIN_LENGTH = 3;
const VENUE_NAME_MAX_LENGTH = 80;
const CITY_MAX_LENGTH = 60;
const TIER_NAME_MAX_LENGTH = 40;

export function createEmptyTier(key: string): TierFormValues {
  return { key, name: "", price: "", capacity: "" };
}

export const EMPTY_EVENT_VALUES: EventFormValues = {
  name: "",
  categorySlug: "conciertos",
  description: "",
  date: "",
  time: "",
  venueName: "",
  city: "",
  imageUrl: null,
  tiers: [createEmptyTier("1"), createEmptyTier("2")],
};

const TIER_PRICE_PATTERN = /^\d{1,5}(\.\d{1,2})?$/;
const TIER_CAPACITY_PATTERN = /^\d{1,6}$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseTierPrice(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  return TIER_PRICE_PATTERN.test(normalized) ? Number(normalized) : null;
}

export function parseTierCapacity(value: string): number | null {
  const trimmed = value.trim();
  if (!TIER_CAPACITY_PATTERN.test(trimmed)) return null;
  const capacity = Number(trimmed);
  return capacity > 0 ? capacity : null;
}

function isValidDate(date: string): boolean {
  const match = DATE_PATTERN.exec(date);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

// Lima no tiene horario de verano: el offset fijo -05:00 es siempre correcto.
export function toStartDate(date: string, time: string): string | null {
  if (!isValidDate(date) || !TIME_PATTERN.test(time)) return null;
  return `${date}T${time}:00-05:00`;
}

export type EventFormData = {
  title: string;
  categorySlug: string;
  description: string;
  startDate: string;
  venueName: string;
  city: string;
  imageUrl: string | null;
  tiers: Array<{ name: string; price: number; capacity: number }>;
};

type Rule = (values: EventFormValues) => string | null;

function createFieldRules(now: Date): Record<EventField, Rule> {
  return {
    name: ({ name }) => {
      const trimmed = name.trim();
      if (!trimmed) return "Ingresa el nombre del evento.";
      return trimmed.length < EVENT_NAME_MIN_LENGTH || trimmed.length > EVENT_NAME_MAX_LENGTH
        ? "Usa entre 3 y 80 caracteres."
        : null;
    },
    categorySlug: ({ categorySlug }) =>
      categories.some((category) => category.slug === categorySlug)
        ? null
        : "Elige una categoría.",
    description: ({ description }) => {
      const trimmed = description.trim();
      if (!trimmed) return "Describe tu evento.";
      if (trimmed.length < DESCRIPTION_MIN_LENGTH)
        return "Cuéntales un poco más: al menos 20 caracteres.";
      if (trimmed.length > DESCRIPTION_MAX_LENGTH) return "Usa como máximo 1000 caracteres.";
      return null;
    },
    date: ({ date, time }) => {
      if (!date) return "Elige la fecha del evento.";
      if (!isValidDate(date)) return "Ingresa una fecha válida.";
      const startDate = toStartDate(date, time);
      if (startDate && new Date(startDate).getTime() <= now.getTime())
        return "Elige una fecha y hora futuras.";
      return null;
    },
    time: ({ time }) => {
      if (!time) return "Elige la hora de inicio.";
      return TIME_PATTERN.test(time) ? null : "Ingresa una hora válida.";
    },
    venueName: ({ venueName }) => {
      const trimmed = venueName.trim();
      if (!trimmed) return "Ingresa el lugar del evento.";
      return trimmed.length > VENUE_NAME_MAX_LENGTH ? "Usa como máximo 80 caracteres." : null;
    },
    city: ({ city }) => {
      const trimmed = city.trim();
      if (!trimmed) return "Ingresa la ciudad.";
      return trimmed.length > CITY_MAX_LENGTH ? "Usa como máximo 60 caracteres." : null;
    },
  };
}

function getTierPriceError(value: string): string | null {
  if (!value.trim()) return "Ingresa el precio.";
  const price = parseTierPrice(value);
  if (price === null) return "Ingresa un monto válido, por ejemplo 45 o 45.50.";
  return price > TIER_MAX_PRICE ? "El precio máximo es S/ 10,000." : null;
}

function getTierCapacityError(value: string): string | null {
  if (!value.trim()) return "Ingresa la cantidad.";
  const capacity = parseTierCapacity(value);
  if (capacity === null) return "Ingresa una cantidad entera mayor que 0.";
  return capacity > TIER_MAX_CAPACITY ? "La cantidad máxima es 100,000." : null;
}

function addTierIssues(tiers: ReadonlyArray<TierFormValues>, ctx: z.RefinementCtx) {
  if (tiers.length < 1 || tiers.length > MAX_TIERS) {
    ctx.addIssue({ code: "custom", path: ["tiers"], message: "Agrega entre 1 y 10 tipos de entrada." });
  }
  const usedNames = new Set<string>();
  tiers.forEach((tier, index) => {
    const name = tier.name.trim();
    let nameError: string | null = null;
    if (!name) nameError = "Ingresa el nombre.";
    else if (name.length > TIER_NAME_MAX_LENGTH) nameError = "Usa como máximo 40 caracteres.";
    else {
      const normalized = name.toLowerCase();
      if (usedNames.has(normalized)) nameError = "Ya usaste este nombre.";
      usedNames.add(normalized);
    }
    const errors: Record<TierField, string | null> = {
      name: nameError,
      price: getTierPriceError(tier.price),
      capacity: getTierCapacityError(tier.capacity),
    };
    for (const field of TIER_FIELDS) {
      const message = errors[field];
      if (message) ctx.addIssue({ code: "custom", path: ["tiers", index, field], message });
    }
  });
}

// Forma permisiva + un único superRefine: en zod 4 los refinamientos no corren si la forma
// ya falla, y el formulario debe reportar todos los campos inválidos a la vez.
export function createEventFormSchema(now: Date): z.ZodType<EventFormData, EventFormValues> {
  const fieldRules = createFieldRules(now);
  return z
    .object({
      name: z.string(),
      categorySlug: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      venueName: z.string(),
      city: z.string(),
      imageUrl: z.string().nullable(),
      tiers: z.array(
        z.object({ key: z.string(), name: z.string(), price: z.string(), capacity: z.string() }),
      ),
    })
    .superRefine((values, ctx) => {
      for (const field of EVENT_FIELDS) {
        const message = fieldRules[field](values);
        if (message) ctx.addIssue({ code: "custom", path: [field], message });
      }
      if (values.imageUrl !== null && !isAllowedOrganizerImageUrl(values.imageUrl)) {
        ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "Imagen no válida." });
      }
      addTierIssues(values.tiers, ctx);
    })
    .transform((values) => ({
      title: values.name.trim(),
      categorySlug: values.categorySlug,
      description: values.description.trim(),
      startDate: toStartDate(values.date, values.time) as string,
      venueName: values.venueName.trim(),
      city: values.city.trim(),
      imageUrl: values.imageUrl,
      tiers: values.tiers.map((tier) => ({
        name: tier.name.trim(),
        price: parseTierPrice(tier.price) as number,
        capacity: parseTierCapacity(tier.capacity) as number,
      })),
    }));
}

export type EventFormErrors = {
  fields: FieldErrors<EventField>;
  tiers: Record<string, FieldErrors<TierField>>;
};

const isEventField = (value: unknown): value is EventField =>
  (EVENT_FIELDS as ReadonlyArray<unknown>).includes(value);
const isTierField = (value: unknown): value is TierField =>
  (TIER_FIELDS as ReadonlyArray<unknown>).includes(value);

export function getEventFormErrors(values: EventFormValues, now: Date): EventFormErrors {
  const errors: EventFormErrors = { fields: {}, tiers: {} };
  const result = createEventFormSchema(now).safeParse(values);
  if (result.success) return errors;
  for (const { path, message } of result.error.issues) {
    const [first, index, field] = path;
    if (isEventField(first)) {
      errors.fields[first] ??= message;
    } else if (first === "tiers" && typeof index === "number" && isTierField(field)) {
      const key = values.tiers[index]?.key;
      if (key === undefined) continue;
      const tierErrors = (errors.tiers[key] ??= {});
      tierErrors[field] ??= message;
    }
  }
  return errors;
}

export function getEventFieldId(field: EventField): string {
  return `event-${field}`;
}

export function getTierFieldId(key: string, field: TierField): string {
  return `event-tier-${key}-${field}`;
}

export function getFirstInvalidFieldId(
  values: EventFormValues,
  errors: EventFormErrors,
): string | null {
  const field = EVENT_FIELDS.find((eventField) => errors.fields[eventField] !== undefined);
  if (field) return getEventFieldId(field);
  for (const tier of values.tiers) {
    const tierField = TIER_FIELDS.find((name) => errors.tiers[tier.key]?.[name] !== undefined);
    if (tierField) return getTierFieldId(tier.key, tierField);
  }
  return null;
}
