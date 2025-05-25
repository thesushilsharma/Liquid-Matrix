"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderBook } from "@/hooks/useOrderBook";
import { Trade } from "@/lib/types/order";
import { formatNumber } from "@/lib/utils/format";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const TradeHistory = () => {
  const { recentTrades, marketStats } = useOrderBook();
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine price precision
  const pricePrecision =
    marketStats.bestBid >= 1000
      ? 0
      : marketStats.bestBid >= 100
      ? 1
      : marketStats.bestBid >= 10
      ? 2
      : 4;

  // Handle price direction animation
  useEffect(() => {
    if (recentTrades.length === 0) return;

    const currentTrade = recentTrades[0];

    if (lastTrade && currentTrade.id !== lastTrade.id) {
      if (currentTrade.price > lastTrade.price) {
        setPriceDirection("up");
      } else if (currentTrade.price < lastTrade.price) {
        setPriceDirection("down");
      }

      // Reset direction after animation
      const timer = setTimeout(() => {
        setPriceDirection(null);
      }, 1000);

      return () => clearTimeout(timer);
    }

    setLastTrade(currentTrade);
  }, [recentTrades, lastTrade]);

  // Auto-scroll to keep latest trades visible
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [recentTrades.length]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Trades</CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="grid grid-cols-12 text-xs font-medium px-4 py-1 bg-muted">
          <div className="col-span-4">Time</div>
          <div className="col-span-4 text-right">Price</div>
          <div className="col-span-4 text-right">Size</div>
        </div>
        <div className="max-h-[300px] overflow-y-auto" ref={containerRef}>
          {recentTrades.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No trades yet
            </div>
          ) : (
            recentTrades.map((trade, index) => {
              const isLatestTrade = index === 0;
              const time = new Date(trade.timestamp);
              const timeString = `${time
                .getHours()
                .toString()
                .padStart(2, "0")}:${time
                .getMinutes()
                .toString()
                .padStart(2, "0")}:${time
                .getSeconds()
                .toString()
                .padStart(2, "0")}`;

              return (
                <div
                  key={trade.id}
                  className={cn(
                    "grid grid-cols-12 px-4 py-1 text-xs hover:bg-accent/10 transition-colors",
                    isLatestTrade &&
                      priceDirection === "up" &&
                      "animate-pulse bg-chart-1/5",
                    isLatestTrade &&
                      priceDirection === "down" &&
                      "animate-pulse bg-destructive/5"
                  )}
                >
                  <div className="col-span-4 font-mono">{timeString}</div>
                  <div
                    className={cn(
                      "col-span-4 text-right font-mono font-medium flex items-center justify-end",
                      index > 0 &&
                        trade.price > recentTrades[index - 1].price &&
                        "text-chart-1",
                      index > 0 &&
                        trade.price < recentTrades[index - 1].price &&
                        "text-destructive"
                    )}
                  >
                    {formatNumber(trade.price, pricePrecision)}
                    {isLatestTrade && priceDirection === "up" && (
                      <ArrowUpIcon className="h-3 w-3 ml-1 text-chart-1" />
                    )}
                    {isLatestTrade && priceDirection === "down" && (
                      <ArrowDownIcon className="h-3 w-3 ml-1 text-destructive" />
                    )}
                  </div>
                  <div className="col-span-4 text-right font-mono">
                    {formatNumber(trade.quantity, 4)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
