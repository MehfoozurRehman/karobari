/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents_ops from "../agents/ops.js";
import type * as businesses from "../businesses.js";
import type * as catalog from "../catalog.js";
import type * as catalogAI from "../catalogAI.js";
import type * as contact from "../contact.js";
import type * as domains from "../domains.js";
import type * as employees from "../employees.js";
import type * as images from "../images.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_billing from "../lib/billing.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_phone from "../lib/phone.js";
import type * as orders from "../orders.js";
import type * as paymentsCustomer from "../paymentsCustomer.js";
import type * as ratings from "../ratings.js";
import type * as siteContentAI from "../siteContentAI.js";
import type * as users from "../users.js";
import type * as whatsapp_messagesDb from "../whatsapp/messagesDb.js";
import type * as whatsapp_send from "../whatsapp/send.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agents/ops": typeof agents_ops;
  businesses: typeof businesses;
  catalog: typeof catalog;
  catalogAI: typeof catalogAI;
  contact: typeof contact;
  domains: typeof domains;
  employees: typeof employees;
  images: typeof images;
  "lib/access": typeof lib_access;
  "lib/billing": typeof lib_billing;
  "lib/dates": typeof lib_dates;
  "lib/phone": typeof lib_phone;
  orders: typeof orders;
  paymentsCustomer: typeof paymentsCustomer;
  ratings: typeof ratings;
  siteContentAI: typeof siteContentAI;
  users: typeof users;
  "whatsapp/messagesDb": typeof whatsapp_messagesDb;
  "whatsapp/send": typeof whatsapp_send;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
