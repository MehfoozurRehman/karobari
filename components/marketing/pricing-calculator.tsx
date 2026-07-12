"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

const FREE_ORDERS = 20;
const BASE_FEE_RS = 300;
const COMMISSION = 0.02;

function rs(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}

export function PricingCalculator() {
  const [orders, setOrders] = useState(150);
  const [ticketSize, setTicketSize] = useState(1200);

  const billableOrders = Math.max(0, orders - FREE_ORDERS);
  const baseFee = billableOrders > 0 ? BASE_FEE_RS : 0;
  const commission = billableOrders * ticketSize * COMMISSION;
  const totalFee = baseFee + commission;
  const revenue = orders * ticketSize;

  return (
    <Card className="rounded-3xl border-stone-200 bg-white shadow-sm">
      <CardContent className="space-y-8 p-6 sm:p-8">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-stone-900">
            Monthly Fee Calculator
          </h3>
          <p className="text-sm text-stone-500">
            Drag the sliders to estimate your platform fee.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-stone-700">
                Orders per month
              </span>
              <span className="font-bold text-emerald-700">{orders}</span>
            </div>
            <Slider
              value={[orders]}
              onValueChange={(v) => setOrders(Array.isArray(v) ? v[0] : v)}
              min={10}
              max={1000}
              step={10}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-stone-700">
                Average order value
              </span>
              <span className="font-bold text-emerald-700">
                {rs(ticketSize)}
              </span>
            </div>
            <Slider
              value={[ticketSize]}
              onValueChange={(v) => setTicketSize(Array.isArray(v) ? v[0] : v)}
              min={100}
              max={10000}
              step={100}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-2xl bg-[#f4f2ec] p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-stone-500">
              Estimated Revenue
            </p>
            <p className="mt-1 text-lg font-extrabold text-stone-900">
              {rs(revenue)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">
              Billable Orders
            </p>
            <p className="mt-1 text-lg font-extrabold text-stone-900">
              {billableOrders}
              <span className="ml-1 text-xs font-medium text-stone-500">
                (first {FREE_ORDERS} free)
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500">
              Total Platform Fee
            </p>
            <p className="mt-1 text-lg font-extrabold text-emerald-700">
              {rs(totalFee)}
            </p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-stone-400">
          Fee = Rs. {BASE_FEE_RS} base (only in months with billable orders) +
          2% of each completed order after your first {FREE_ORDERS} free
          orders. Pay monthly via EasyPaisa, JazzCash, or bank transfer.
        </p>
      </CardContent>
    </Card>
  );
}
