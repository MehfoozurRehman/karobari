import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const businessCategory = v.union(
  v.literal("restaurant"),
  v.literal("hotel"),
  v.literal("salon"),
  v.literal("shop"),
  v.literal("other"),
);

export const businessStatus = v.union(
  v.literal("onboarding"),
  v.literal("active"),
  v.literal("grace"),
  v.literal("suspended"),
);

export const orderStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("preparing"),
  v.literal("ready"),
  v.literal("delivered"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const paymentSettings = v.object({
  codEnabled: v.boolean(),
  easypaisa: v.optional(
    v.object({ accountName: v.string(), number: v.string() }),
  ),
  jazzcash: v.optional(
    v.object({ accountName: v.string(), number: v.string() }),
  ),
  bank: v.optional(
    v.object({
      bankName: v.string(),
      accountTitle: v.string(),
      iban: v.string(),
    }),
  ),
});

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    businessId: v.optional(v.id("businesses")),
    role: v.union(v.literal("owner"), v.literal("admin")),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_phone", ["phone"]),

  businesses: defineTable({
    slug: v.string(),
    name: v.string(),
    category: businessCategory,
    description: v.string(),
    ownerUserId: v.optional(v.id("users")),
    ownerPhone: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    status: businessStatus,
    createdVia: v.union(v.literal("web"), v.literal("whatsapp")),
    themeId: v.string(),
    paymentSettings,
    hours: v.optional(v.string()),
    deliveryInfo: v.optional(v.string()),
    freeOrdersUsed: v.number(),
    lifetimeCompletedOrders: v.number(),
    nextOrderNumber: v.number(),
    suspendedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_ownerPhone", ["ownerPhone"])
    .index("by_status", ["status"]),

  catalogCategories: defineTable({
    businessId: v.id("businesses"),
    name: v.string(),
    sortOrder: v.number(),
  }).index("by_businessId", ["businessId"]),

  catalogItems: defineTable({
    businessId: v.id("businesses"),
    categoryId: v.optional(v.id("catalogCategories")),
    name: v.string(),
    description: v.optional(v.string()),
    pricePaisa: v.number(),
    discountPct: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
    imageStatus: v.union(
      v.literal("none"),
      v.literal("generating"),
      v.literal("ready"),
    ),
    available: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_businessId", ["businessId"])
    .index("by_businessId_and_categoryId", ["businessId", "categoryId"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["businessId"],
    }),

  orders: defineTable({
    businessId: v.id("businesses"),
    orderNumber: v.number(),
    customerPhone: v.string(),
    customerName: v.optional(v.string()),
    customerAddress: v.optional(v.string()),
    note: v.optional(v.string()),
    source: v.union(v.literal("storefront"), v.literal("whatsapp")),
    status: orderStatus,
    paymentMethod: v.union(
      v.literal("cod"),
      v.literal("easypaisa"),
      v.literal("jazzcash"),
    ),
    paymentStatus: v.union(
      v.literal("unpaid"),
      v.literal("proof_submitted"),
      v.literal("paid"),
    ),
    subtotalPaisa: v.number(),
    discountPaisa: v.number(),
    totalPaisa: v.number(),
    tipPaisa: v.optional(v.number()),
    trackingToken: v.string(),
    billedLedgerEntryId: v.optional(v.id("ledgerEntries")),
    completedAt: v.optional(v.number()),
  })
    .index("by_businessId", ["businessId"])
    .index("by_businessId_and_status", ["businessId", "status"])
    .index("by_trackingToken", ["trackingToken"])
    .index("by_businessId_and_customerPhone", ["businessId", "customerPhone"])
    .index("by_businessId_and_completedAt", ["businessId", "completedAt"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    businessId: v.id("businesses"),
    catalogItemId: v.optional(v.id("catalogItems")),
    nameSnapshot: v.string(),
    unitPricePaisa: v.number(),
    qty: v.number(),
    lineTotalPaisa: v.number(),
  }).index("by_orderId", ["orderId"]),

  paymentProofs: defineTable({
    orderId: v.id("orders"),
    businessId: v.id("businesses"),
    tid: v.optional(v.string()),
    screenshotStorageId: v.optional(v.id("_storage")),
    method: v.union(v.literal("easypaisa"), v.literal("jazzcash")),
    status: v.union(
      v.literal("submitted"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  })
    .index("by_orderId", ["orderId"])
    .index("by_businessId_and_status", ["businessId", "status"]),

  ratings: defineTable({
    orderId: v.id("orders"),
    businessId: v.id("businesses"),
    stars: v.number(),
    comment: v.optional(v.string()),
    tipPaisa: v.number(),
  })
    .index("by_businessId", ["businessId"])
    .index("by_orderId", ["orderId"]),

  whatsappAccounts: defineTable({
    businessId: v.id("businesses"),
    wabaId: v.string(),
    phoneNumberId: v.string(),
    displayPhoneNumber: v.string(),
    accessToken: v.string(),
    pin: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("connected"),
      v.literal("error"),
    ),
    connectedAt: v.number(),
    lastError: v.optional(v.string()),
  })
    .index("by_businessId", ["businessId"])
    .index("by_phoneNumberId", ["phoneNumberId"]),

  conversations: defineTable({
    businessId: v.optional(v.id("businesses")),
    channelPhoneNumberId: v.string(),
    peerPhone: v.string(),
    kind: v.union(
      v.literal("customer"),
      v.literal("owner"),
      v.literal("onboarding"),
    ),
    agentState: v.optional(v.any()),
    lastInboundAt: v.number(),
    peerName: v.optional(v.string()),
  })
    .index("by_channelPhoneNumberId_and_peerPhone", [
      "channelPhoneNumberId",
      "peerPhone",
    ])
    .index("by_businessId", ["businessId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    direction: v.union(v.literal("in"), v.literal("out")),
    waMessageId: v.optional(v.string()),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("tool"),
      v.literal("system"),
    ),
    text: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.string()),
    toolCalls: v.optional(v.any()),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_waMessageId", ["waMessageId"]),

  onboardingSessions: defineTable({
    peerPhone: v.string(),
    step: v.union(
      v.literal("name"),
      v.literal("category"),
      v.literal("description"),
      v.literal("catalog"),
      v.literal("payments"),
      v.literal("confirm"),
      v.literal("done"),
    ),
    draft: v.any(),
    businessId: v.optional(v.id("businesses")),
  }).index("by_peerPhone", ["peerPhone"]),

  ledgerEntries: defineTable({
    businessId: v.id("businesses"),
    period: v.string(),
    baseFeePaisa: v.number(),
    commissionPaisa: v.number(),
    completedOrderCount: v.number(),
    completedVolumePaisa: v.number(),
    status: v.union(
      v.literal("open"),
      v.literal("due"),
      v.literal("proof_submitted"),
      v.literal("paid"),
      v.literal("waived"),
    ),
    dueAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    adminNote: v.optional(v.string()),
  })
    .index("by_businessId_and_period", ["businessId", "period"])
    .index("by_status", ["status"])
    .index("by_period", ["period"]),

  platformPayments: defineTable({
    businessId: v.id("businesses"),
    ledgerEntryId: v.id("ledgerEntries"),
    method: v.union(
      v.literal("easypaisa"),
      v.literal("jazzcash"),
      v.literal("bank"),
      v.literal("manual"),
    ),
    tid: v.optional(v.string()),
    screenshotStorageId: v.optional(v.id("_storage")),
    amountPaisa: v.number(),
    status: v.union(
      v.literal("submitted"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    reviewedBy: v.optional(v.string()),
    reviewNote: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_ledgerEntryId", ["ledgerEntryId"])
    .index("by_businessId", ["businessId"]),

  employees: defineTable({
    businessId: v.id("businesses"),
    name: v.string(),
    phone: v.optional(v.string()),
    roleTitle: v.optional(v.string()),
    monthlySalaryPaisa: v.number(),
    active: v.boolean(),
  }).index("by_businessId", ["businessId"]),

  salaryEntries: defineTable({
    businessId: v.id("businesses"),
    employeeId: v.id("employees"),
    period: v.string(),
    amountPaisa: v.number(),
    type: v.union(
      v.literal("salary"),
      v.literal("advance"),
      v.literal("bonus"),
      v.literal("deduction"),
    ),
    note: v.optional(v.string()),
    paidAt: v.number(),
  })
    .index("by_businessId_and_period", ["businessId", "period"])
    .index("by_employeeId", ["employeeId"]),

  siteContent: defineTable({
    businessId: v.id("businesses"),
    content: v.any(),
    heroImageStorageId: v.optional(v.id("_storage")),
    version: v.number(),
  }).index("by_businessId", ["businessId"]),

  customDomains: defineTable({
    businessId: v.id("businesses"),
    domain: v.string(),
    status: v.union(
      v.literal("pending_dns"),
      v.literal("verifying"),
      v.literal("active"),
      v.literal("error"),
    ),
    vercelVerification: v.optional(v.any()),
  })
    .index("by_domain", ["domain"])
    .index("by_businessId", ["businessId"]),

  contactQueries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    businessName: v.optional(v.string()),
    message: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("replied"),
      v.literal("closed"),
    ),
  }).index("by_status", ["status"]),
});
