import { z } from "zod";

export enum OrderSide {
  BUY = "BUY",
  SELL = "SELL",
}

export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
}

export enum OrderStatus {
  OPEN = "OPEN",
  PARTIAL = "PARTIAL",
  FILLED = "FILLED",
  CANCELLED = "CANCELLED",
}

export const OrderSchema = z.object({
  id: z.string(),
  side: z.nativeEnum(OrderSide),
  type: z.nativeEnum(OrderType),
  price: z.number().nonnegative().optional(),
  quantity: z.number().positive(),
  filled: z.number().nonnegative().default(0),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.OPEN),
  timestamp: z.number().default(() => Date.now()),
});

export type Order = z.infer<typeof OrderSchema>;

export const TradeSchema = z.object({
  id: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().positive(),
  buyOrderId: z.string(),
  sellOrderId: z.string(),
  timestamp: z.number().default(() => Date.now()),
});

export type Trade = z.infer<typeof TradeSchema>;

export interface PriceLevel {
  price: number;
  quantity: number;
  orders: Order[];
}

export interface OrderBook {
  bids: Map<number, PriceLevel>;
  asks: Map<number, PriceLevel>;
}
