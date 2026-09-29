import { z } from "zod";

// Solo hosts permitidos en next.config.ts o portadas locales (data URL): un valor manipulado
// en sessionStorage no llega a next/image.
export const ORGANIZER_IMAGE_URL_PATTERN =
  /^(?:https:\/\/images\.unsplash\.com\/\S+|data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2})$/;

export function isAllowedOrganizerImageUrl(value: string): boolean {
  return ORGANIZER_IMAGE_URL_PATTERN.test(value);
}

export const organizerEventStatusSchema = z.enum(["published", "draft"]);
export type OrganizerEventStatus = z.infer<typeof organizerEventStatusSchema>;

export const organizerTierSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    capacity: z.number().int().positive(),
    sold: z.number().int().nonnegative(),
  })
  .refine((tier) => tier.sold <= tier.capacity, {
    path: ["sold"],
    message: "Vendidas no puede superar la capacidad.",
  });
export type OrganizerTier = z.infer<typeof organizerTierSchema>;

export const organizerEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  categorySlug: z.string().min(1),
  description: z.string(),
  venueName: z.string().min(1),
  city: z.string().min(1),
  startDate: z.string().datetime({ offset: true }),
  imageUrl: z.string().refine(isAllowedOrganizerImageUrl).nullable(),
  status: organizerEventStatusSchema,
  tiers: z.array(organizerTierSchema).min(1),
  createdAt: z.string().datetime({ offset: true }),
});
export type OrganizerEvent = z.infer<typeof organizerEventSchema>;
