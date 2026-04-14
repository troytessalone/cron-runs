# /py/src/cron_runs/core.py

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from zoneinfo import ZoneInfo

from cron_descriptor import get_description
from croniter import croniter

MIN_COUNT = 0
MAX_COUNT = 100


@dataclass(frozen=True)
class Config:
    cron: str
    timezone: str
    reference_time: datetime
    next_count: int
    prev_count: int


def get_cron_runs(
    *,
    cron: str,
    timezone: str = "UTC",
    reference_time: str | int | float | None = None,
    next: int = 1,
    prev: int = 1,
) -> dict[str, Any]:
    """Get next and previous runs for a standard 5-field cron expression."""
    config = _normalize_config(
        cron=cron,
        timezone=timezone,
        reference_time=reference_time,
        next_count=next,
        prev_count=prev,
    )

    return {
        "cron": {
            "normalized": config.cron,
            "human": _describe_cron(config.cron, config.timezone),
        },
        "timezone": config.timezone,
        "reference_time": _format_timestamp(config.reference_time, config.timezone),
        "next": _get_occurrences(config, "next", config.next_count),
        "prev": _get_occurrences(config, "prev", config.prev_count),
    }


def _normalize_config(
    *,
    cron: str,
    timezone: str,
    reference_time: str | int | float | None,
    next_count: int,
    prev_count: int,
) -> Config:
    cron_value = _normalize_cron(cron)
    _validate_cron(cron_value)

    timezone_value = _normalize_timezone(timezone)
    _validate_timezone(timezone_value)

    next_value = _normalize_count(next_count, "next")
    prev_value = _normalize_count(prev_count, "prev")
    reference_value = _parse_reference_time(reference_time)

    return Config(
        cron=cron_value,
        timezone=timezone_value,
        reference_time=reference_value,
        next_count=next_value,
        prev_count=prev_value,
    )


def _get_occurrences(config: Config, direction: str, count: int) -> list[dict[str, Any]]:
    if count == 0:
        return []

    zone = ZoneInfo(config.timezone)
    base = config.reference_time.astimezone(zone)
    iterator = croniter(config.cron, start_time=base, ret_type=datetime)
    results: list[dict[str, Any]] = []

    for _ in range(count):
        dt = iterator.get_next(datetime) if direction == "next" else iterator.get_prev(datetime)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=zone)
        results.append(_format_timestamp(dt, config.timezone))

    return results


def _format_timestamp(value: datetime, timezone: str) -> dict[str, Any]:
    dt = value if value.tzinfo else value.replace(tzinfo=UTC)
    utc_dt = dt.astimezone(UTC)
    tz_dt = dt.astimezone(ZoneInfo(timezone))
    milliseconds = int(utc_dt.timestamp() * 1000)

    return {
        "iso_utc": utc_dt.isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "iso_tz": tz_dt.isoformat(timespec="milliseconds"),
        "unix_seconds": int(utc_dt.timestamp()),
        "unix_milliseconds": milliseconds,
    }


def _describe_cron(cron: str, timezone: str) -> str | None:
    try:
        return f"{get_description(cron)} ({timezone})"
    except Exception:
        return None


def _normalize_cron(expression: str) -> str:
    value = str(expression or "").strip()
    if not value:
        raise ValueError("cron is required. Example: '0 9 * * 1-5'")
    return " ".join(value.split())


def _validate_cron(expression: str) -> None:
    fields = expression.split()
    if len(fields) != 5:
        raise ValueError(
            f"cron must have exactly 5 fields. Received {len(fields)} field(s): {expression!r}"
        )

    try:
        croniter(expression, datetime.now(UTC))
    except Exception as error:
        raise ValueError(f"invalid cron expression: {expression!r}. {error}") from error


def _normalize_timezone(value: str | None) -> str:
    return str(value or "UTC").strip() or "UTC"


def _validate_timezone(timezone: str) -> None:
    try:
        ZoneInfo(timezone)
    except Exception as error:
        raise ValueError(
            f'invalid timezone: {timezone!r}. Example: "UTC" or "America/Los_Angeles"'
        ) from error


def _parse_reference_time(value: str | int | float | None) -> datetime:
    if value is None or value == "":
        return datetime.now(UTC)

    if isinstance(value, (int, float)):
        return _date_from_unix_number(value, value)

    raw_value = str(value).strip()
    if not raw_value:
        return datetime.now(UTC)

    if raw_value.lstrip("-").isdigit():
        numeric_value = int(raw_value)
        return _date_from_unix_number(numeric_value, raw_value)

    iso_candidate = raw_value.replace("Z", "+00:00")

    try:
        dt = datetime.fromisoformat(iso_candidate)
    except ValueError as error:
        raise ValueError(
            f"reference_time must be a valid ISO datetime, unix seconds, or unix milliseconds. Received: {value!r}"
        ) from error

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    else:
        dt = dt.astimezone(UTC)

    return dt


def _date_from_unix_number(numeric_value: int | float, original_value: Any) -> datetime:
    absolute_value = abs(int(numeric_value))
    digit_count = len(str(absolute_value))
    milliseconds = int(numeric_value * 1000) if digit_count <= 10 else int(numeric_value)

    try:
        return datetime.fromtimestamp(milliseconds / 1000, tz=UTC)
    except Exception as error:
        raise ValueError(
            f"reference_time must be a valid ISO datetime, unix seconds, or unix milliseconds. Received: {original_value!r}"
        ) from error


def _normalize_count(value: Any, field_name: str) -> int:
    try:
        count = int(value)
    except Exception as error:
        raise ValueError(
            f"{field_name} must be an integer between {MIN_COUNT} and {MAX_COUNT}. Received: {value!r}"
        ) from error

    if count < MIN_COUNT or count > MAX_COUNT:
        raise ValueError(
            f"{field_name} must be an integer between {MIN_COUNT} and {MAX_COUNT}. Received: {value!r}"
        )

    return count
