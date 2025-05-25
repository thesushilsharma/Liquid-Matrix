"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrderBook } from "@/hooks/useOrderBook";
import { formatNumber } from "@/lib/utils/format";
import { Order, OrderStatus, OrderType } from "@/lib/types/order";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

export const ActiveOrders = () => {
  const { allOrders, cancelOrder, marketStats } = useOrderBook();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // Filter only active orders (OPEN or PARTIAL)
  useEffect(() => {
    setActiveOrders(
      allOrders
        .filter(
          (order) =>
            order.status === OrderStatus.OPEN ||
            order.status === OrderStatus.PARTIAL
        )
        .sort((a, b) => b.timestamp - a.timestamp)
    );
  }, [allOrders]);

  // Determine price precision
  const pricePrecision =
    marketStats.bestBid >= 1000
      ? 0
      : marketStats.bestBid >= 100
      ? 1
      : marketStats.bestBid >= 10
      ? 2
      : 4;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Active Orders</CardTitle>
          <Badge variant="outline">{activeOrders.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="grid grid-cols-12 text-xs font-medium px-4 py-1 bg-muted">
          <div className="col-span-2">Side</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Filled</div>
          <div className="col-span-2">Action</div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {activeOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No active orders
            </div>
          ) : (
            activeOrders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-12 px-4 py-2 text-xs hover:bg-accent/10 border-t border-border"
              >
                <div
                  className={cn(
                    "col-span-2 font-medium",
                    order.side === "BUY" ? "text-chart-1" : "text-destructive"
                  )}
                >
                  {order.side}
                </div>
                <div className="col-span-2">{order.type}</div>
                <div className="col-span-2 font-mono">
                  {order.type === OrderType.LIMIT
                    ? formatNumber(order.price!, pricePrecision)
                    : "MARKET"}
                </div>
                <div className="col-span-2 font-mono">
                  {formatNumber(order.quantity, 4)}
                </div>
                <div className="col-span-2 font-mono">
                  {formatNumber(order.filled, 4)}
                  <span className="text-muted-foreground ml-1">
                    ({formatNumber((order.filled / order.quantity) * 100, 0)}%)
                  </span>
                </div>
                <div className="col-span-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => cancelOrder(order.id)}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
