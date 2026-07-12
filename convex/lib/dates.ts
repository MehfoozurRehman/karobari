import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const PKT = "Asia/Karachi";

export function nowPkt(ms?: number) {
  return dayjs(ms ?? Date.now()).tz(PKT);
}

export function startOfTodayPktMs(): number {
  return nowPkt().startOf("day").valueOf();
}

export { dayjs };
