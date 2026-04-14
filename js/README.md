# cron-runs for JavaScript

Get the next and previous runs for a standard 5-field cron expression as normalized timestamps.

## Install

```bash
npm install cron-runs
```

## Features

- Standard 5-field cron only
- Timezone-aware output
- Reference time support
- ISO UTC, ISO with timezone offset, Unix seconds, Unix milliseconds
- Human-readable cron description

## Usage

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

## API

### `getCronRuns(options)`

#### Inputs

- `cron` string, required
- `timezone` string, optional, default `UTC`
- `reference_time` string or number, optional, default now
- `next` integer, optional, default `1`
- `prev` integer, optional, default `1`

#### Notes

- `reference_time` accepts:
  - ISO UTC
  - ISO with timezone offset
  - Unix seconds
  - Unix milliseconds
- `next` and `prev` can be `0` through `100`
- This package does not schedule jobs. It only calculates occurrences.
