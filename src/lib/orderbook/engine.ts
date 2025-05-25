import { v4 as uuidv4 } from "uuid";
import {
  Order,
  OrderSide,
  OrderStatus,
  OrderType,
  PriceLevel,
  Trade,
} from "../types/order";

export class OrderBookEngine {
  private bids: Map<number, PriceLevel> = new Map();
  private asks: Map<number, PriceLevel> = new Map();
  private orders: Map<string, Order> = new Map();
  private trades: Trade[] = [];
  private listeners: Set<() => void> = new Set();

  // Add an order to the order book
  public addOrder(
    order: Omit<Order, "id" | "status" | "filled" | "timestamp">
  ): Order {
    const newOrder: Order = {
      id: uuidv4(),
      status: OrderStatus.OPEN,
      filled: 0,
      timestamp: Date.now(),
      ...order,
    };

    // If it's a market order, execute immediately
    if (order.type === OrderType.MARKET) {
      return this.executeMarketOrder(newOrder);
    }

    // For limit orders, try to match or add to the book
    return this.processLimitOrder(newOrder);
  }

  // Process a limit order
  private processLimitOrder(order: Order): Order {
    // Try to match the order first
    const updatedOrder = this.matchOrder(order);

    // If order is not fully filled, add to book
    if (updatedOrder.status !== OrderStatus.FILLED) {
      this.addToBook(updatedOrder);
    }

    this.orders.set(updatedOrder.id, updatedOrder);
    this.notifyListeners();
    return updatedOrder;
  }

  // Execute a market order
  private executeMarketOrder(order: Order): Order {
    const updatedOrder = this.matchOrder(order);

    // Market orders that can't be filled completely are marked as filled anyway
    // as they execute at whatever liquidity is available
    if (updatedOrder.status !== OrderStatus.FILLED) {
      updatedOrder.status = OrderStatus.FILLED;
    }

    this.orders.set(updatedOrder.id, updatedOrder);
    this.notifyListeners();
    return updatedOrder;
  }

  // Match an order against the order book
  private matchOrder(order: Order): Order {
    const updatedOrder = { ...order };

    // Determine which side of the book to match against
    const oppositeSide = order.side === OrderSide.BUY ? this.asks : this.bids;

    // For buy orders, we want the lowest asks first; for sell orders, highest bids first
    const sortedPrices = [...oppositeSide.keys()].sort(
      order.side === OrderSide.BUY ? (a, b) => a - b : (a, b) => b - a
    );

    // Check each price level for potential matches
    for (const price of sortedPrices) {
      // For limit orders, respect the limit price
      if (order.type === OrderType.LIMIT) {
        if (
          (order.side === OrderSide.BUY && price > order.price!) ||
          (order.side === OrderSide.SELL && price < order.price!)
        ) {
          continue; // Skip this price level as it's outside our limit
        }
      }

      const level = oppositeSide.get(price)!;
      let remainingQuantity = updatedOrder.quantity - updatedOrder.filled;

      // Match against orders at this level until either the level is exhausted or our order is filled
      for (let i = 0; i < level.orders.length && remainingQuantity > 0; i++) {
        const matchedOrder = level.orders[i];
        const availableQty = matchedOrder.quantity - matchedOrder.filled;
        const matchQty = Math.min(remainingQuantity, availableQty);

        // Execute the trade
        this.executeTrade(updatedOrder, matchedOrder, price, matchQty);

        remainingQuantity -= matchQty;

        // Update the state of the matched order
        const updatedMatchedOrder = {
          ...matchedOrder,
          filled: matchedOrder.filled + matchQty,
          status:
            matchedOrder.filled + matchQty >= matchedOrder.quantity
              ? OrderStatus.FILLED
              : OrderStatus.PARTIAL,
        };

        // Update the order in our maps
        this.orders.set(matchedOrder.id, updatedMatchedOrder);

        // Update our own order state
        updatedOrder.filled += matchQty;
        updatedOrder.status =
          updatedOrder.filled >= updatedOrder.quantity
            ? OrderStatus.FILLED
            : OrderStatus.PARTIAL;

        // If the matched order is now filled, remove it from the book
        if (updatedMatchedOrder.status === OrderStatus.FILLED) {
          level.quantity -= updatedMatchedOrder.quantity;
          level.orders = level.orders.filter((o) => o.id !== matchedOrder.id);

          // If the level is now empty, remove it
          if (level.quantity <= 0) {
            oppositeSide.delete(price);
            break;
          }
        }

        // If our order is fully filled, we're done
        if (updatedOrder.status === OrderStatus.FILLED) {
          break;
        }
      }

      // If our order is fully filled, we're done
      if (updatedOrder.status === OrderStatus.FILLED) {
        break;
      }
    }

    return updatedOrder;
  }

  // Add an order to the order book
  private addToBook(order: Order): void {
    if (order.type !== OrderType.LIMIT) return; // Only limit orders go in the book

    const side = order.side === OrderSide.BUY ? this.bids : this.asks;
    const price = order.price!;

    // Get or create the price level
    if (!side.has(price)) {
      side.set(price, {
        price,
        quantity: 0,
        orders: [],
      });
    }

    const level = side.get(price)!;
    level.quantity += order.quantity - order.filled;
    level.orders.push(order);
  }

  // Execute a trade between two orders
  private executeTrade(
    buyOrder: Order,
    sellOrder: Order,
    price: number,
    quantity: number
  ): void {
    const trade: Trade = {
      id: uuidv4(),
      price,
      quantity,
      buyOrderId: buyOrder.side === OrderSide.BUY ? buyOrder.id : sellOrder.id,
      sellOrderId: buyOrder.side === OrderSide.BUY ? sellOrder.id : buyOrder.id,
      timestamp: Date.now(),
    };

    this.trades.push(trade);
  }

  // Cancel an order
  public cancelOrder(orderId: string): boolean {
    const order = this.orders.get(orderId);
    if (
      !order ||
      order.status === OrderStatus.FILLED ||
      order.status === OrderStatus.CANCELLED
    ) {
      return false;
    }

    // Find the order in the book and remove it
    const side = order.side === OrderSide.BUY ? this.bids : this.asks;
    if (order.type === OrderType.LIMIT && side.has(order.price!)) {
      const level = side.get(order.price!)!;
      const remainingQty = order.quantity - order.filled;
      level.quantity -= remainingQty;
      level.orders = level.orders.filter((o) => o.id !== order.id);

      // If the level is now empty, remove it
      if (level.quantity <= 0) {
        side.delete(order.price!);
      }
    }

    // Update the order status
    const updatedOrder = { ...order, status: OrderStatus.CANCELLED };
    this.orders.set(orderId, updatedOrder);

    this.notifyListeners();
    return true;
  }

  // Get the current state of the order book
  public getOrderBook() {
    return {
      bids: Array.from(this.bids.entries())
        .map(([price, level]) => ({
          price,
          quantity: level.quantity,
        }))
        .sort((a, b) => b.price - a.price), // Bids sorted high to low

      asks: Array.from(this.asks.entries())
        .map(([price, level]) => ({
          price,
          quantity: level.quantity,
        }))
        .sort((a, b) => a.price - b.price), // Asks sorted low to high
    };
  }

  // Get market statistics
  public getMarketStats() {
    const book = this.getOrderBook();
    const bestBid = book.bids[0]?.price || 0;
    const bestAsk = book.asks[0]?.price || 0;
    const spread = bestAsk - bestBid;
    const spreadPercentage = bestBid ? (spread / bestBid) * 100 : 0;

    // Calculate volume in the last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentTrades = this.trades.filter((t) => t.timestamp >= oneDayAgo);
    const volume = recentTrades.reduce((sum, trade) => sum + trade.quantity, 0);

    // Calculate VWAP (Volume Weighted Average Price)
    const vwap = recentTrades.length
      ? recentTrades.reduce(
          (sum, trade) => sum + trade.price * trade.quantity,
          0
        ) / volume
      : 0;

    return {
      bestBid,
      bestAsk,
      spread,
      spreadPercentage,
      volume,
      vwap,
      lastPrice: this.trades[this.trades.length - 1]?.price || 0,
      tradeCount: this.trades.length,
    };
  }

  // Get order by ID
  public getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  // Get all orders
  public getAllOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  // Get recent trades
  public getRecentTrades(limit: number = 50): Trade[] {
    return [...this.trades].reverse().slice(0, limit);
  }

  // Register a listener to be notified of changes
  public registerListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of a change
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Reset the order book
  public reset(): void {
    this.bids.clear();
    this.asks.clear();
    this.orders.clear();
    this.trades = [];
    this.notifyListeners();
  }
}

// Create a singleton instance
export const orderBookEngine = new OrderBookEngine();
