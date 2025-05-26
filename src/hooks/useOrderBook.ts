import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { orderBookEngine } from "../lib/orderbook/engine";
import { Order, OrderSide, OrderType } from "@/lib/types/order";

// Query keys for better organization
const QUERY_KEYS = {
  orderBook: ['orderBook'] as const,
  marketStats: ['marketStats'] as const,
  allOrders: ['allOrders'] as const,
  recentTrades: ['recentTrades'] as const,
};

export function useOrderBook() {
  const queryClient = useQueryClient();

  // Query for order book data
  const orderBookQuery = useQuery({
    queryKey: QUERY_KEYS.orderBook,
    queryFn: () => orderBookEngine.getOrderBook(),
    staleTime: 0, // Always consider stale for real-time updates
    refetchInterval: 100, // Refetch every 100ms for real-time feel
    initialData: orderBookEngine.getOrderBook(), // Provide initial data
  });

  // Query for market stats
  const marketStatsQuery = useQuery({
    queryKey: QUERY_KEYS.marketStats,
    queryFn: () => orderBookEngine.getMarketStats(),
    staleTime: 0,
    refetchInterval: 100,
    initialData: orderBookEngine.getMarketStats(),
  });

  // Query for all orders
  const allOrdersQuery = useQuery({
    queryKey: QUERY_KEYS.allOrders,
    queryFn: () => orderBookEngine.getAllOrders(),
    staleTime: 0,
    refetchInterval: 100,
    initialData: orderBookEngine.getAllOrders(),
  });

  // Query for recent trades
  const recentTradesQuery = useQuery({
    queryKey: QUERY_KEYS.recentTrades,
    queryFn: () => orderBookEngine.getRecentTrades(),
    staleTime: 0,
    refetchInterval: 100,
    initialData: orderBookEngine.getRecentTrades(),
  });

  // Helper function to invalidate all queries
  const invalidateAllQueries = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orderBook });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketStats });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allOrders });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recentTrades });
  };

  // Mutation for placing an order
  const placeOrderMutation = useMutation({
    mutationFn: async ({
      side,
      type,
      quantity,
      price,
    }: {
      side: OrderSide;
      type: OrderType;
      quantity: number;
      price?: number;
    }): Promise<Order> => {
      return orderBookEngine.addOrder({
        side,
        type,
        quantity,
        price: type === OrderType.LIMIT ? price : undefined,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch all related queries
      invalidateAllQueries();
    },
  });

  // Mutation for canceling an order
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string): Promise<boolean> => {
      return orderBookEngine.cancelOrder(orderId);
    },
    onSuccess: () => {
      // Invalidate and refetch all related queries
      invalidateAllQueries();
    },
  });

  // Mutation for resetting the order book
  const resetOrderBookMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      orderBookEngine.reset();
    },
    onSuccess: () => {
      // Invalidate and refetch all related queries
      invalidateAllQueries();
    },
  });

  // Wrapper functions for easier usage
  const placeOrder = (
    side: OrderSide,
    type: OrderType,
    quantity: number,
    price?: number
  ) => {
    return placeOrderMutation.mutate({ side, type, quantity, price });
  };

  const cancelOrder = (orderId: string) => {
    return cancelOrderMutation.mutate(orderId);
  };

  const resetOrderBook = () => {
    return resetOrderBookMutation.mutate();
  };

  return {
    // Data from queries
    orderBook: orderBookQuery.data,
    marketStats: marketStatsQuery.data,
    allOrders: allOrdersQuery.data,
    recentTrades: recentTradesQuery.data,
    
    // Loading states
    isOrderBookLoading: orderBookQuery.isLoading,
    isMarketStatsLoading: marketStatsQuery.isLoading,
    isAllOrdersLoading: allOrdersQuery.isLoading,
    isRecentTradesLoading: recentTradesQuery.isLoading,
    
    // Error states
    orderBookError: orderBookQuery.error,
    marketStatsError: marketStatsQuery.error,
    allOrdersError: allOrdersQuery.error,
    recentTradesError: recentTradesQuery.error,
    
    // Mutation functions
    placeOrder,
    cancelOrder,
    resetOrderBook,
    
    // Mutation states
    isPlacingOrder: placeOrderMutation.isPending,
    isCancelingOrder: cancelOrderMutation.isPending,
    isResettingOrderBook: resetOrderBookMutation.isPending,
    
    // Mutation errors
    placeOrderError: placeOrderMutation.error,
    cancelOrderError: cancelOrderMutation.error,
    resetOrderBookError: resetOrderBookMutation.error,
    
    // Manual refetch functions
    refetchOrderBook: orderBookQuery.refetch,
    refetchMarketStats: marketStatsQuery.refetch,
    refetchAllOrders: allOrdersQuery.refetch,
    refetchRecentTrades: recentTradesQuery.refetch,
  };
}