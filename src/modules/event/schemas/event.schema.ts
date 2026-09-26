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
