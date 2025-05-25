"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderBook } from "@/hooks/useOrderBook";
import { formatNumber } from "@/lib/utils/format";
import {
  TrendingDown,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowRightLeft,
} from "lucide-react";

export const MarketStats = () => {
  const { marketStats } = useOrderBook();

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
        <CardTitle className="text-lg">Market Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Best Bid
          </div>
          <div className="text-xl font-mono font-medium text-chart-1">
            {formatNumber(marketStats.bestBid, pricePrecision)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> Best Ask
          </div>
          <div className="text-xl font-mono font-medium text-destructive">
            {formatNumber(marketStats.bestAsk, pricePrecision)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" /> Spread
          </div>
          <div className="text-xl font-mono">
            {formatNumber(marketStats.spread, pricePrecision)}{" "}
            <span className="text-xs text-muted-foreground">
              ({formatNumber(marketStats.spreadPercentage, 2)}%)
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" /> 24h Volume
          </div>
          <div className="text-xl font-mono">
            {formatNumber(marketStats.volume, 2)}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <BarChart3 className="h-3 w-3" /> VWAP
          </div>
          <div className="text-xl font-mono">
            {formatNumber(marketStats.vwap, pricePrecision)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
