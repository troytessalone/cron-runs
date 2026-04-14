export type TimestampOutput = {
  iso_utc: string;
  iso_tz: string;
  unix_seconds: number;
  unix_milliseconds: number;
};

export type CronRunsResult = {
  cron: {
    normalized: string;
    human: string | null;
  };
  timezone: string;
  reference_time: TimestampOutput;
  next: TimestampOutput[];
  prev: TimestampOutput[];
};

export type GetCronRunsOptions = {
  cron: string;
  timezone?: string;
  reference_time?: string | number;
  next?: number;
  prev?: number;
};

export function getCronRuns(options: GetCronRunsOptions): CronRunsResult;
export default getCronRuns;
