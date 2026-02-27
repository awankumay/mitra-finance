const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { env } = require("./env");

dayjs.extend(utc);
dayjs.extend(timezone);

function ensureTimezone() {
  process.env.TZ = env.TZ;
}

function todayJakarta() {
  return dayjs().tz(env.TZ).format("YYYY-MM-DD");
}

function isFutureDate(inputDate) {
  const date = dayjs.tz(inputDate, "YYYY-MM-DD", env.TZ);
  const today = dayjs().tz(env.TZ).startOf("day");
  return date.isAfter(today);
}

module.exports = {
  ensureTimezone,
  todayJakarta,
  isFutureDate,
};
