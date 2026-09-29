import { z } from "zod";

import { documentTypeSchema, paymentMethodSchema } from "@/modules/order/schemas/checkout.schema";

export const orderLineSchema = z.object({
  tierId: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  qty: z.number().int().positive(),
  seatIds: z.array(z.string()),
  seatLabels: z.array(z.string()),
  amount: z.number().nonnegative(),
});
export type OrderLine = z.infer<typeof orderLineSchema>;

export const orderEventSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  imageUrl: z.string().url(),
  categoryName: z.string().min(1),
  venueName: z.string().min(1),
  city: z.string().min(1),
  startDate: z.string().min(1),
});
export type OrderEvent = z.infer<typeof orderEventSchema>;

export const orderBuyerSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  documentType: documentTypeSchema,
  documentNumber: z.string().min(1),
  phone: z.string().regex(/^9\d{8}$/),
});

export const orderSchema = z.object({
  id: z.string().regex(/^TK-\d{5}$/),
  createdAt: z.string().datetime(),
  event: orderEventSchema,
  lines: z.array(orderLineSchema).min(1),
  count: z.number().int().positive(),
  total: z.number().nonnegative(),
  buyer: orderBuyerSchema,
  paymentMethod: paymentMethodSchema,
  // Solo con "card". Nunca se guarda el número completo, el CVV ni el vencimiento.
  cardLast4: z.string().regex(/^\d{4}$/).nullable(),
});
export type Order = z.infer<typeof orderSchema>;
