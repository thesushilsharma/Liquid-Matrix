"use client";

import { useMemo } from "react";
//import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderBook } from "@/hooks/useOrderBook";
import { formatNumber } from "@/lib/utils/format";

export const OrderBookVisualizer = () => {
  const { orderBook, marketStats } = useOrderBook();

  // Calculate the maximum quantity for scaling the depth visualization
  const maxQuantity = useMemo(() => {
    const allQuantities = [
      ...orderBook.bids.map((level) => level.quantity),
      ...orderBook.asks.map((level) => level.quantity),
    ];
    return Math.max(...allQuantities, 1);
  }, [orderBook]);

  // Helper function to calculate the width percentage based on quantity
  const getWidthPercentage = (quantity: number) => {
    return `${Math.min(100, (quantity / maxQuantity) * 100)}%`;
  };

  // Determine price precision based on the best bid/ask
  const pricePrecision = useMemo(() => {
    const price = marketStats.bestBid || marketStats.bestAsk || 0;
    if (price >= 1000) return 0;
    if (price >= 100) return 1;
    if (price >= 10) return 2;
    return 4;
  }, [marketStats]);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center flex justify-between items-center">
          <span>Order Book</span>
          <div className="text-sm font-normal">
            Spread: {formatNumber(marketStats.spread, pricePrecision)} (
            {formatNumber(marketStats.spreadPercentage, 2)}%)
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="flex">
          {/* Bids (Buy) Side */}
          <div className="w-1/2 border-r border-border">
            <div className="grid grid-cols-12 text-xs font-medium px-4 py-1 bg-muted">
              <div className="col-span-6">Price</div>
              <div className="col-span-3 text-right">Size</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {orderBook.bids.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No bids
                </div>
              )}
              {orderBook.bids.map((level, i) => {
                // Calculate cumulative volume
                const totalVolume = orderBook.bids
                  .slice(0, i + 1)
                  .reduce((sum, bid) => sum + bid.quantity, 0);

                return (
                  <div key={level.price} className="relative">
                    <div
                      className="absolute inset-y-0 right-0 bg-chart-1/10"
                      style={{ width: getWidthPercentage(level.quantity) }}
                    />
                    <div className="grid grid-cols-12 px-4 py-1 text-xs relative z-10 hover:bg-accent/10">
                      <div className="col-span-6 text-chart-1 font-mono font-medium">
                        {formatNumber(level.price, pricePrecision)}
                      </div>
                      <div className="col-span-3 text-right font-mono">
                        {formatNumber(level.quantity, 4)}
                      </div>
                      <div className="col-span-3 text-right font-mono">
                        {formatNumber(totalVolume, 4)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asks (Sell) Side */}
          <div className="w-1/2">
            <div className="grid grid-cols-12 text-xs font-medium px-4 py-1 bg-muted">
              <div className="col-span-6">Price</div>
              <div className="col-span-3 text-right">Size</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {orderBook.asks.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No asks
                </div>
              )}
              {orderBook.asks.map((level, i) => {
                // Calculate cumulative volume
                const totalVolume = orderBook.asks
                  .slice(0, i + 1)
                  .reduce((sum, ask) => sum + ask.quantity, 0);

                return (
                  <div key={level.price} className="relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-destructive/10"
                      style={{ width: getWidthPercentage(level.quantity) }}
                    />
                    <div className="grid grid-cols-12 px-4 py-1 text-xs relative z-10 hover:bg-accent/10">
                      <div className="col-span-6 text-destructive font-mono font-medium">
                        {formatNumber(level.price, pricePrecision)}
                      </div>
                      <div className="col-span-3 text-right font-mono">
                        {formatNumber(level.quantity, 4)}
                      </div>
                      <div className="col-span-3 text-right font-mono">
                        {formatNumber(totalVolume, 4)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
