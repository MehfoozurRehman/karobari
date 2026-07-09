"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingCalculator() {
  const [orders, setOrders] = useState(150);
  const [ticketSize, setTicketSize] = useState(1200);

  const totalSalesVal = orders * ticketSize;
  const freeQuota = 20;
  const billableOrders = Math.max(0, orders - freeQuota);
  const baseFee = billableOrders > 0 ? 300 : 0;
  const variableFee = billableOrders * ticketSize * 0.02;
  const platformFee = baseFee + variableFee;

  return (
    <Card className="w-full border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-lg font-medium text-white">Monthly Orders Volume</h4>
            <p className="text-sm text-zinc-400">Estimate how many orders your store receives per month</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-emerald-400">{orders}</span>
            <span className="text-zinc-500 text-sm ml-1">orders/mo</span>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={orders}
            onChange={(e) => setOrders(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg bg-zinc-800 appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>10 orders</span>
            <span>500 orders</span>
            <span>1,000+ orders</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-zinc-800/50 pt-4">
          <div>
            <h4 className="text-lg font-medium text-white">Average Order Value</h4>
            <p className="text-sm text-zinc-400">Specify average price of your products/services</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-emerald-400">Rs. {ticketSize}</span>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={ticketSize}
            onChange={(e) => setTicketSize(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg bg-zinc-800 appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Rs. 100</span>
            <span>Rs. 5,000</span>
            <span>Rs. 10,000+</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80">
          <div className="p-4 rounded-xl bg-zinc-950/40">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Avg Order Value</p>
            <p className="text-xl font-bold text-white mt-1">Rs. {ticketSize.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/40">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Estimated Revenue</p>
            <p className="text-xl font-bold text-zinc-200 mt-1">Rs. {totalSalesVal.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
            <p className="text-xs text-emerald-500/80 uppercase tracking-wider">Total Platform Fee</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">Rs. {platformFee.toLocaleString()}</p>
          </div>
        </div>

        <div className="text-xs text-zinc-500 space-y-1">
          <p className="flex justify-between">
            <span>First 20 Orders:</span>
            <span className="text-emerald-400 font-medium">Free (Rs. 0 Commission)</span>
          </p>
          <p className="flex justify-between">
            <span>Base Platform Fee:</span>
            <span>Rs. {baseFee} / mo</span>
          </p>
          <p className="flex justify-between">
            <span>Variable Commission (2%):</span>
            <span>Rs. {variableFee.toLocaleString()}</span>
          </p>
          <p className="flex justify-between">
            <span>Billable Orders:</span>
            <span>{billableOrders} orders</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
