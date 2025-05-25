'use client';

import { useEffect } from 'react';
import { useOrderBook } from '@/hooks/useOrderBook';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { OrderBookVisualizer } from '@/components/orderbook/OrderBookVisualizer';
import { OrderEntryForm } from '@/components/orderbook/OrderEntryForm';
import { DepthChart } from '@/components/orderbook/DepthChart';
import { TradeHistory } from '@/components/orderbook/TradeHistory';
import { MarketStats } from '@/components/orderbook/MarketStats';
import { ActiveOrders } from '@/components/orderbook/ActiveOrders';
import { OrderSide, OrderType } from '@/lib/types/order';
import { useAuth } from '@/hooks/useAuth';

export default function AccountPage() {
  const { placeOrder } = useOrderBook();
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/');
    }
  }, [session, loading, router]);

  // Initialize with some demo orders
  useEffect(() => {
    if (!session) return;

    // Add initial sample data for demonstration
    const addSampleOrders = () => {
      // Add some bids
      placeOrder(OrderSide.BUY, OrderType.LIMIT, 1.5, 98);
      placeOrder(OrderSide.BUY, OrderType.LIMIT, 2.5, 97);
      placeOrder(OrderSide.BUY, OrderType.LIMIT, 5, 96);
      placeOrder(OrderSide.BUY, OrderType.LIMIT, 7.5, 95);
      placeOrder(OrderSide.BUY, OrderType.LIMIT, 10, 94);

      // Add some asks
      placeOrder(OrderSide.SELL, OrderType.LIMIT, 1, 102);
      placeOrder(OrderSide.SELL, OrderType.LIMIT, 2, 103);
      placeOrder(OrderSide.SELL, OrderType.LIMIT, 3, 104);
      placeOrder(OrderSide.SELL, OrderType.LIMIT, 4, 105);
      placeOrder(OrderSide.SELL, OrderType.LIMIT, 5, 106);

      // Add a matching order to create a trade
      placeOrder(OrderSide.BUY, OrderType.LIMIT, 0.5, 102);
    };

    const timer = setTimeout(() => {
      addSampleOrders();
    }, 500);

    return () => clearTimeout(timer);
  }, [placeOrder, session]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid gap-6">
        <MarketStats />

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card className="p-0 overflow-hidden">
              <DepthChart />
            </Card>
          </div>
          <div className="lg:col-span-1">
            <OrderEntryForm />
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <OrderBookVisualizer />
          </div>
          <div className="lg:col-span-1">
            <TradeHistory />
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1">
          <ActiveOrders />
        </div>
      </div>
    </div>
  );
}