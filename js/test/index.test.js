// /js/test/index.test.js

import test from 'node:test';
import assert from 'node:assert/strict';
import { getCronRuns } from '../src/index.js';

test('returns normalized output', () => {
  const result = getCronRuns({
    cron: '0 9 * * 1-5',
    timezone: 'America/Los_Angeles',
    reference_time: '2026-04-14T10:30:00-07:00',
    next: 1,
    prev: 1
  });

  assert.equal(result.cron.normalized, '0 9 * * 1-5');
  assert.equal(result.timezone, 'America/Los_Angeles');
  assert.equal(result.next.length, 1);
  assert.equal(result.prev.length, 1);
  assert.ok(typeof result.reference_time.iso_utc === 'string');
  assert.ok(typeof result.reference_time.unix_milliseconds === 'number');
});

test('accepts unix seconds as reference_time', () => {
  const result = getCronRuns({
    cron: '0 9 * * 1-5',
    timezone: 'UTC',
    reference_time: 1776197400,
    next: 1,
    prev: 0
  });

  assert.equal(result.next.length, 1);
  assert.equal(result.prev.length, 0);
});
