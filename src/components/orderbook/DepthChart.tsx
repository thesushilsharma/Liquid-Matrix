"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderBook } from "@/hooks/useOrderBook";
import { formatNumber } from "@/lib/utils/format";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type DepthChartDataPoint = {
  price: number;
  bidDepth: number;
  askDepth: number;
};

export const DepthChart = () => {
  const { orderBook, marketStats } = useOrderBook();

  // Process data for the depth chart
  const depthData = useMemo(() => {
    const bidPoints: DepthChartDataPoint[] = [];
    const askPoints: DepthChartDataPoint[] = [];
    let cumulativeBidVolume = 0;
    let cumulativeAskVolume = 0;

    // Process bids (sorted high to low)
    for (const level of orderBook.bids) {
      cumulativeBidVolume += level.quantity;
      bidPoints.push({
        price: level.price,
        bidDepth: cumulativeBidVolume,
        askDepth: 0,
      });
    }

    // Process asks (sorted low to high)
    for (const level of orderBook.asks) {
      cumulativeAskVolume += level.quantity;
      askPoints.push({
        price: level.price,
        askDepth: cumulativeAskVolume,
        bidDepth: 0,
      });
    }

    // Combine and sort by price
    const combinedPoints = [...bidPoints, ...askPoints].sort(
      (a, b) => a.price - b.price
    );

    // Add zero points at the spread to create a gap
    if (bidPoints.length > 0 && askPoints.length > 0) {
      const highestBid = Math.max(...bidPoints.map((p) => p.price));
      const lowestAsk = Math.min(...askPoints.map((p) => p.price));

      combinedPoints.push({
        price: highestBid,
        bidDepth: cumulativeBidVolume,
        askDepth: 0,
      });

      combinedPoints.push({
        price: lowestAsk,
        bidDepth: 0,
        askDepth: cumulativeAskVolume,
      });
    }

    return combinedPoints.sort((a, b) => a.price - b.price);
  }, [orderBook]);

  // Determine price range for the chart
  const priceRange = useMemo(() => {
    if (depthData.length === 0) return { min: 0, max: 100 };

    const prices = depthData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1; // Add 10% padding

    return {
      min: Math.max(0, min - padding),
      max: max + padding,
    };
  }, [depthData]);

  // Determine depth range
  const depthRange = useMemo(() => {
    if (depthData.length === 0) return { max: 10 };

    const maxBidDepth = Math.max(...depthData.map((d) => d.bidDepth));
    const maxAskDepth = Math.max(...depthData.map((d) => d.askDepth));
    const max = Math.max(maxBidDepth, maxAskDepth);

    return {
      max: max * 1.1, // Add 10% padding
    };
  }, [depthData]);

  // Determine price precision based on the price range
  const pricePrecision = useMemo(() => {
    const price = marketStats.bestBid || marketStats.bestAsk || 0;
    if (price >= 1000) return 0;
    if (price >= 100) return 1;
    if (price >= 10) return 2;
    return 4;
  }, [marketStats]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Market Depth</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {depthData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No order book data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={depthData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="price"
                type="number"
                domain={[priceRange.min, priceRange.max]}
                tickFormatter={(value) => formatNumber(value, pricePrecision)}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                domain={[0, depthRange.max]}
                tickFormatter={(value) => formatNumber(value, 2)}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                formatter={(value: number) => [
                  formatNumber(value, 4),
                  "Volume",
                ]}
                labelFormatter={(label) =>
                  `Price: ${formatNumber(label, pricePrecision)}`
                }
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Area
                type="stepAfter"
                dataKey="bidDepth"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1)/0.3)"
                strokeWidth={2}
              />
              <Area
                type="stepAfter"
                dataKey="askDepth"
                stroke="hsl(var(--destructive))"
                fill="hsl(var(--destructive)/0.3)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
