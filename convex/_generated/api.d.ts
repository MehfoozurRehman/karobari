/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as businesses from "../businesses.js";
import type * as catalog from "../catalog.js";
import type * as catalogAI from "../catalogAI.js";
import type * as contact from "../contact.js";
import type * as employees from "../employees.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_billing from "../lib/billing.js";
import type * as lib_phone from "../lib/phone.js";
import type * as orders from "../orders.js";
import type * as paymentsCustomer from "../paymentsCustomer.js";
import type * as ratings from "../ratings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  businesses: typeof businesses;
  catalog: typeof catalog;
  catalogAI: typeof catalogAI;
  contact: typeof contact;
  employees: typeof employees;
  "lib/access": typeof lib_access;
  "lib/billing": typeof lib_billing;
  "lib/phone": typeof lib_phone;
  orders: typeof orders;
  paymentsCustomer: typeof paymentsCustomer;
  ratings: typeof ratings;
  users: typeof users;
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
