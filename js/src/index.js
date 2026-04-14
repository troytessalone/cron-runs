// /js/src/index.js

import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";
import { DateTime } from "luxon";

const MIN_COUNT = 0;
const MAX_COUNT = 100;

/**
 * Get next and previous runs for a standard 5-field cron expression.
 *
 * @param {{
 *   cron: string,
 *   timezone?: string,
 *   reference_time?: string | number,
 *   next?: number,
 *   prev?: number
 * }} options
 */
export function getCronRuns(options) {
  const config = normalizeConfig(options);

  return {
    cron: {
      normalized: config.cron,
      human: describeCron(config.cron, config.timezone)
    },
    timezone: config.timezone,
    reference_time: formatTimestamp(config.referenceTime, config.timezone),
    next: getOccurrences(config, "next", config.next),
    prev: getOccurrences(config, "prev", config.prev)
  };
}

export default getCronRuns;

function normalizeConfig(options) {
  const cronInput = String(options?.cron || "").trim();

  if (!cronInput) {
    throw new Error("cron is required. Example: '0 9 * * 1-5'");
  }

  const cron = normalizeCron(cronInput);
  const cronFields = getCronFieldCount(cron);

  if (cronFields !== 5) {
    throw new Error(
      `cron must have exactly 5 fields. Received ${cronFields} field(s): ${JSON.stringify(cron)}`
    );
  }

  const timezone = normalizeTimezone(options?.timezone);
  validateTimeZone(timezone);

  const next = normalizeCount(options?.next, "next", 1);
  const prev = normalizeCount(options?.prev, "prev", 1);
  const referenceTime = parseReferenceTime(options?.reference_time);

  const parserOptions = {
    tz: timezone,
    currentDate: referenceTime
  };

  validateCron(cron, parserOptions);

  return {
    cron,
    timezone,
    referenceTime,
    next,
    prev,
    parserOptions
  };
}

function getOccurrences(config, direction, count) {
  if (count === 0) {
    return [];
  }

  const interval = CronExpressionParser.parse(config.cron, config.parserOptions);
  const results = new Array(count);

  for (let i = 0; i < count; i++) {
    const date =
      direction === "next"
        ? interval.next().toDate()
        : interval.prev().toDate();

    results[i] = formatTimestamp(date, config.timezone);
  }

  return results;
}

function formatTimestamp(date, timezone) {
  const utcDateTime = DateTime.fromJSDate(date, { zone: "utc" });
  const tzDateTime = utcDateTime.setZone(timezone);
  const milliseconds = date.getTime();

  return {
    iso_utc: utcDateTime.toISO({ suppressMilliseconds: false }),
    iso_tz: tzDateTime.toISO({ suppressMilliseconds: false }),
    unix_seconds: Math.floor(milliseconds / 1000),
    unix_milliseconds: milliseconds
  };
}

function describeCron(cron, timezone) {
  try {
    const description = cronstrue.toString(cron, {
      verbose: true,
      use24HourTimeFormat: true,
      trimHoursLeadingZero: true,
      locale: "en"
    });

    return `${description} (${timezone})`;
  } catch {
    return null;
  }
}

function normalizeTimezone(value) {
  return String(value || "UTC").trim() || "UTC";
}

function normalizeCron(expression) {
  return expression.trim().replace(/\s+/g, " ");
}

function parseReferenceTime(value) {
  if (value === undefined || value === null || value === "") {
    return new Date();
  }

  if (typeof value === "number") {
    return dateFromUnixNumber(value, value);
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return new Date();
  }

  if (/^-?\d+$/.test(rawValue)) {
    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue)) {
      throw new Error(
        `reference_time is invalid. Received: ${JSON.stringify(value)}`
      );
    }

    return dateFromUnixNumber(numericValue, rawValue);
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `reference_time must be a valid ISO datetime, unix seconds, or unix milliseconds. Received: ${JSON.stringify(value)}`
    );
  }

  return date;
}

function dateFromUnixNumber(numericValue, originalValue) {
  const absoluteValue = Math.abs(numericValue);
  const digitCount = String(Math.trunc(absoluteValue)).length;
  const milliseconds = digitCount <= 10 ? numericValue * 1000 : numericValue;

  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `reference_time must be a valid ISO datetime, unix seconds, or unix milliseconds. Received: ${JSON.stringify(originalValue)}`
    );
  }

  return date;
}

function normalizeCount(value, fieldName, defaultValue) {
  const rawValue = value ?? defaultValue;
  const count = Number(rawValue);

  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
    throw new Error(
      `${fieldName} must be an integer between ${MIN_COUNT} and ${MAX_COUNT}. Received: ${JSON.stringify(rawValue)}`
    );
  }

  return count;
}

function validateTimeZone(timeZone) {
  const zoned = DateTime.now().setZone(timeZone);

  if (!zoned.isValid) {
    throw new Error(
      `invalid timezone: ${JSON.stringify(timeZone)}. Example: "UTC" or "America/Los_Angeles"`
    );
  }
}

function getCronFieldCount(expression) {
  return expression.trim().split(/\s+/).length;
}

function validateCron(expression, parserOptions) {
  try {
    CronExpressionParser.parse(expression, parserOptions);
  } catch (error) {
    throw new Error(
      `invalid cron expression: ${JSON.stringify(expression)}. ${error.message}`
    );
  }
}
