import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  icon: z.string(),
  colorClass: z.string(),
});
export type Category = z.infer<typeof categorySchema>;

export const eventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  imageUrl: z.string().url(),
  categorySlug: z.string(),
  venueName: z.string(),
  city: z.string(),
  startDate: z.string(),
  priceFrom: z.number().nonnegative(),
  currency: z.literal("PEN"),
  featured: z.boolean(),
  status: z.enum(["available", "last_tickets", "sold_out"]),
});
export type Event = z.infer<typeof eventSchema>;

export const ticketTierStatusSchema = z.enum(["available", "last_tickets", "sold_out"]);

export const ticketTierSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  status: ticketTierStatusSchema,
});
export type TicketTier = z.infer<typeof ticketTierSchema>;

export const eventDetailSchema = eventSchema.extend({
  description: z.string().min(1),
  doorsOpenAt: z.string().datetime({ offset: true }),
  minAge: z.number().int().nonnegative().nullable(),
  venueAddress: z.string().min(1),
  tiers: z.array(ticketTierSchema).min(1),
});
export type EventDetail = z.infer<typeof eventDetailSchema>;
