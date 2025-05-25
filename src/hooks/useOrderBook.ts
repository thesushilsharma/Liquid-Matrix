import { useEffect, useState } from "react";
import { orderBookEngine } from "../lib/orderbook/engine";
import { Order, OrderSide, OrderType } from "@/lib/types/order";

export function useOrderBook() {
  const [orderBook, setOrderBook] = useState(orderBookEngine.getOrderBook());
  const [marketStats, setMarketStats] = useState(
    orderBookEngine.getMarketStats()
  );
  const [allOrders, setAllOrders] = useState(orderBookEngine.getAllOrders());
  const [recentTrades, setRecentTrades] = useState(
    orderBookEngine.getRecentTrades()
  );

  useEffect(() => {
    // Register a listener to update state when the order book changes
    const unregister = orderBookEngine.registerListener(() => {
      setOrderBook(orderBookEngine.getOrderBook());
      setMarketStats(orderBookEngine.getMarketStats());
      setAllOrders(orderBookEngine.getAllOrders());
      setRecentTrades(orderBookEngine.getRecentTrades());
    });

    return unregister;
  }, []);

  // Create a function to add an order
  const placeOrder = (
    side: OrderSide,
    type: OrderType,
    quantity: number,
    price?: number
  ): Order => {
    return orderBookEngine.addOrder({
      side,
      type,
      quantity,
      price: type === OrderType.LIMIT ? price : undefined,
    });
  };

  // Create a function to cancel an order
  const cancelOrder = (orderId: string): boolean => {
    return orderBookEngine.cancelOrder(orderId);
  };

  // Reset the order book
  const resetOrderBook = (): void => {
    orderBookEngine.reset();
  };

  return {
    orderBook,
    marketStats,
    allOrders,
    recentTrades,
    placeOrder,
    cancelOrder,
    resetOrderBook,
  };
}
