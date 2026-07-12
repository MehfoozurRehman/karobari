import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwner } from "./lib/access";
import { currentPeriod } from "./lib/billing";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const { business } = await requireOwner(ctx);
    return await ctx.db
      .query("employees")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .take(200);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    roleTitle: v.optional(v.string()),
    monthlySalaryRupees: v.number(),
  },
  returns: v.id("employees"),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    return await ctx.db.insert("employees", {
      businessId: business._id,
      name: args.name,
      phone: args.phone,
      roleTitle: args.roleTitle,
      monthlySalaryPaisa: Math.round(args.monthlySalaryRupees * 100),
      active: true,
    });
  },
});

export const update = mutation({
  args: {
    employeeId: v.id("employees"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    roleTitle: v.optional(v.string()),
    monthlySalaryRupees: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const employee = await ctx.db.get("employees", args.employeeId);
    if (!employee || employee.businessId !== business._id)
      throw new Error("Employee not found");
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.roleTitle !== undefined) patch.roleTitle = args.roleTitle;
    if (args.monthlySalaryRupees !== undefined)
      patch.monthlySalaryPaisa = Math.round(args.monthlySalaryRupees * 100);
    if (args.active !== undefined) patch.active = args.active;
    await ctx.db.patch("employees", args.employeeId, patch);
    return null;
  },
});

export const addSalaryEntry = mutation({
  args: {
    employeeId: v.id("employees"),
    amountRupees: v.number(),
    type: v.union(
      v.literal("salary"),
      v.literal("advance"),
      v.literal("bonus"),
      v.literal("deduction"),
    ),
    note: v.optional(v.string()),
    period: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const employee = await ctx.db.get("employees", args.employeeId);
    if (!employee || employee.businessId !== business._id)
      throw new Error("Employee not found");
    await ctx.db.insert("salaryEntries", {
      businessId: business._id,
      employeeId: args.employeeId,
      period: args.period ?? currentPeriod(),
      amountPaisa: Math.round(args.amountRupees * 100),
      type: args.type,
      note: args.note,
      paidAt: Date.now(),
    });
    return null;
  },
});

export const salaryEntries = query({
  args: { period: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const period = args.period ?? currentPeriod();
    const entries = await ctx.db
      .query("salaryEntries")
      .withIndex("by_businessId_and_period", (q) =>
        q.eq("businessId", business._id).eq("period", period),
      )
      .order("desc")
      .take(500);
    return await Promise.all(
      entries.map(async (e) => {
        const employee = await ctx.db.get("employees", e.employeeId);
        return { ...e, employeeName: employee?.name ?? "(deleted)" };
      }),
    );
  },
});
