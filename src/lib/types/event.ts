import { z } from "zod";

export const EventTypeEnum = z.enum(["ELECTION", "SPORTS", "OTHER"]);
export const EventStatusEnum = z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]);

export const EventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  type: EventTypeEnum,
  status: EventStatusEnum,
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  externalId: z.string().nullable(),
  externalData: z.record(z.unknown()).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Event = z.infer<typeof EventSchema>;
export type EventType = z.infer<typeof EventTypeEnum>;
export type EventStatus = z.infer<typeof EventStatusEnum>;
