"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useOrderBook } from "@/hooks/useOrderBook";
import { OrderSide, OrderType } from "@/lib/types/order";
import { cn } from "@/lib/utils";

const OrderFormSchema = z.object({
  side: z.enum(["BUY", "SELL"]),
  type: z.enum(["LIMIT", "MARKET"]),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().positive().optional(),
});

type OrderFormValues = z.infer<typeof OrderFormSchema>;

export const OrderEntryForm = () => {
  const { placeOrder, marketStats } = useOrderBook();
  const [activeTab, setActiveTab] = useState("limit");

  const defaultValues: Partial<OrderFormValues> = {
    side: OrderSide.BUY,
    type: OrderType.LIMIT,
    quantity: 1,
    price: marketStats.bestBid || 100,
  };

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues,
  });

  const { watch, setValue } = form;
  const orderType = watch("type");

  const onSubmit = (data: OrderFormValues) => {
    placeOrder(
      data.side as OrderSide,
      data.type as OrderType,
      data.quantity,
      data.price
    );

    // Reset the form but keep the side and price
    form.reset({
      side: data.side,
      type: data.type,
      quantity: 1,
      price: data.price,
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setValue("type", value === "limit" ? OrderType.LIMIT : OrderType.MARKET);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="limit">Limit</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
              </TabsList>

              <FormField
                control={form.control}
                name="side"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Side</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-1"
                      >
                        <div className="flex items-center justify-between gap-4 w-full mb-2">
                          <div className="flex-1">
                            <RadioGroupItem
                              value="BUY"
                              id="buy"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="buy"
                              className="block w-full py-3 px-4 text-center peer-data-[state=checked]:bg-chart-1 peer-data-[state=checked]:text-white bg-secondary hover:bg-secondary/80 rounded-md cursor-pointer transition-colors"
                            >
                              Buy
                            </Label>
                          </div>
                          <div className="flex-1">
                            <RadioGroupItem
                              value="SELL"
                              id="sell"
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor="sell"
                              className="block w-full py-3 px-4 text-center peer-data-[state=checked]:bg-destructive peer-data-[state=checked]:text-white bg-secondary hover:bg-secondary/80 rounded-md cursor-pointer transition-colors"
                            >
                              Sell
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TabsContent value="limit" className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0.01"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.0001"
                        min="0.0001"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Tabs>

            <Button
              type="submit"
              className={cn(
                "w-full",
                watch("side") === "BUY"
                  ? "bg-chart-1 hover:bg-chart-1/90"
                  : "bg-destructive hover:bg-destructive/90"
              )}
            >
              {watch("side") === "BUY" ? "Buy" : "Sell"}{" "}
              {watch("type") === "LIMIT" ? "Limit" : "Market"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
