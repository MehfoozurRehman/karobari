export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-cyan-100 text-cyan-800",
  delivered: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-700 text-white",
  cancelled: "bg-stone-200 text-stone-600",
};

/** The forward transitions available from each status (mirrors convex/orders.ts). */
export const NEXT_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};
