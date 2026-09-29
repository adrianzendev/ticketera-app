import { z } from "zod";

export const pointSchema = z.object({ x: z.number(), y: z.number() });
export type Point = z.infer<typeof pointSchema>;

export const seatStatusSchema = z.enum(["available", "reserved", "sold"]);
export type SeatStatus = z.infer<typeof seatStatusSchema>;

export const seatSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  status: seatStatusSchema,
});
export type Seat = z.infer<typeof seatSchema>;

export const seatRowSchema = z.object({
  label: z.string().min(1),
  seats: z.array(seatSchema).min(1),
});
export type SeatRow = z.infer<typeof seatRowSchema>;

const zoneBaseSchema = z.object({
  id: z.string().min(1),
  tierId: z.string().min(1),
  name: z.string().min(1),
  shape: z.string().min(1),
  labelPosition: pointSchema,
});

export const standingZoneSchema = zoneBaseSchema.extend({ kind: z.literal("standing") });
export const seatedZoneSchema = zoneBaseSchema.extend({
  kind: z.literal("seated"),
  rows: z.array(seatRowSchema).min(1),
});
export const venueZoneSchema = z.discriminatedUnion("kind", [standingZoneSchema, seatedZoneSchema]);
export type StandingZone = z.infer<typeof standingZoneSchema>;
export type SeatedZone = z.infer<typeof seatedZoneSchema>;
export type VenueZone = z.infer<typeof venueZoneSchema>;

export const venueMapSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  viewBox: z.object({ width: z.number().positive(), height: z.number().positive() }),
  stage: z.object({
    shape: z.string().min(1),
    label: z.string().min(1),
    labelPosition: pointSchema,
  }),
  zones: z.array(venueZoneSchema).min(1),
});
export type VenueMap = z.infer<typeof venueMapSchema>;
