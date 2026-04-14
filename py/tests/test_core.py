# /py/tests/test_core.py

from cron_runs import get_cron_runs


def test_returns_normalized_output() -> None:
    result = get_cron_runs(
        cron="0 9 * * 1-5",
        timezone="America/Los_Angeles",
        reference_time="2026-04-14T10:30:00-07:00",
        next=1,
        prev=1,
    )

    assert result["cron"]["normalized"] == "0 9 * * 1-5"
    assert result["timezone"] == "America/Los_Angeles"
    assert len(result["next"]) == 1
    assert len(result["prev"]) == 1
    assert "iso_utc" in result["reference_time"]
    assert "unix_milliseconds" in result["reference_time"]


def test_accepts_unix_seconds_reference_time() -> None:
    result = get_cron_runs(
        cron="0 9 * * 1-5",
        timezone="UTC",
        reference_time=1776197400,
        next=1,
        prev=0,
    )

    assert len(result["next"]) == 1
    assert len(result["prev"]) == 0
