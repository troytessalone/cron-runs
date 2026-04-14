# cron-runs for Python

Get the next and previous runs for a standard 5-field cron expression as normalized timestamps.

## Install

```bash
pip install cron-runs
```

## Features

- Standard 5-field cron only
- Timezone-aware output
- Reference time support
- ISO UTC, ISO with timezone offset, Unix seconds, Unix milliseconds
- Human-readable cron description

## Usage

```python
from cron_runs import get_cron_runs

result = get_cron_runs(
    cron='0 9 * * 1-5',
    timezone='America/Los_Angeles',
    reference_time='2026-04-14T10:30:00-07:00',
    next=2,
    prev=1,
)

print(result)
```

## API

### `get_cron_runs(...)`

#### Inputs

- `cron` str, required
- `timezone` str, optional, default `UTC`
- `reference_time` str or int or float, optional, default now
- `next` int, optional, default `1`
- `prev` int, optional, default `1`

#### Notes

- `reference_time` accepts:
  - ISO UTC
  - ISO with timezone offset
  - Unix seconds
  - Unix milliseconds
- `next` and `prev` can be `0` through `100`
- This package does not schedule jobs. It only calculates occurrences.
