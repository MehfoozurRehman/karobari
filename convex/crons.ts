import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "close monthly ledgers",
  "30 19 1 * *",
  internal.billing.closeMonthlyLedgers,
  {},
);

crons.cron(
  "suspend overdue businesses",
  "0 20 * * *",
  internal.billing.suspendOverdue,
  {},
);

crons.interval(
  "check pending custom domains",
  { minutes: 30 },
  internal.domains.checkPending,
  {},
);

export default crons;
