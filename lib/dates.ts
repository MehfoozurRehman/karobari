import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const PKT = "Asia/Karachi";

export function formatDateTime(ms: number): string {
  return dayjs(ms).tz(PKT).format("DD MMM YYYY, h:mm A");
}

export function formatDate(ms: number): string {
  return dayjs(ms).tz(PKT).format("DD MMM YYYY");
}

export { dayjs };
