# cron-runs

Get the next and previous runs for a standard 5-field cron expression as normalized timestamps.

`cron-runs` is a small utility package for:
- standard cron input
- timezone-aware run calculation
- reference time support
- normalized timestamp output
- identical conceptual API for JavaScript and Python

It is **not** a scheduler. It does **not** run jobs. It only calculates occurrences.

## Scope

- Standard **5-field cron only**
- Timezone-aware
- Accepts reference time as ISO datetime, Unix seconds, or Unix milliseconds
- Returns all 4 timestamp forms for each occurrence:
  - `iso_utc`
  - `iso_tz`
  - `unix_seconds`
  - `unix_milliseconds`

## Output shape

```json
{
  "cron": {
    "normalized": "0 9 * * 1-5",
    "human": "At 09:00, Monday through Friday (America/Los_Angeles)"
  },
  "timezone": "America/Los_Angeles",
  "reference_time": {
    "iso_utc": "2026-04-14T17:30:00.000Z",
    "iso_tz": "2026-04-14T10:30:00.000-07:00",
    "unix_seconds": 1776197400,
    "unix_milliseconds": 1776197400000
  },
  "next": [
    {
      "iso_utc": "2026-04-15T16:00:00.000Z",
      "iso_tz": "2026-04-15T09:00:00.000-07:00",
      "unix_seconds": 1776268800,
      "unix_milliseconds": 1776268800000
    }
  ],
  "prev": [
    {
      "iso_utc": "2026-04-14T16:00:00.000Z",
      "iso_tz": "2026-04-14T09:00:00.000-07:00",
      "unix_seconds": 1776182400,
      "unix_milliseconds": 1776182400000
    }
  ]
}
```

## Repositories and packages

- JavaScript package: `./js`
- Python package: `./py`

## JavaScript quick example

```js
import { getCronRuns } from 'cron-runs';

const result = getCronRuns({
  cron: '0 9 * * 1-5',
  timezone: 'America/Los_Angeles',
  reference_time: '2026-04-14T10:30:00-07:00',
  next: 2,
  prev: 1
});

console.log(result);
```

## Python quick example

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

## Folder structure

```text
cron-runs/
├── README.md
├── LICENSE
├── .gitignore
├── js/
│   ├── README.md
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   └── index.d.ts
│   └── test/
│       └── index.test.js
└── py/
    ├── README.md
    ├── pyproject.toml
    ├── src/
    │   └── cron_runs/
    │       ├── __init__.py
    │       └── core.py
    └── tests/
        └── test_core.py
```
