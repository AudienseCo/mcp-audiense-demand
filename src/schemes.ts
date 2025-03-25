import { z } from 'zod';

const VALID_COUNTRIES = [
  "Weighted-Total",
  "Global",
  "US",
  "GB",
  "AU",
  "CA",
  "DE",
  "FR",
  "IN",
  "JP",
  "IT",
  "ES",
  "BR",
  "MX",
  "AR",
  "NL",
  "SE",
  "DK",
  "NO",
  "PL",
  "TR"
] as const;

const VALID_COUNTRIES_AND_WEIGHTED_TOTAL = [
  "Weighted-Total",
  ...VALID_COUNTRIES
] as const;

export const VALID_COUNTRIES_SCHEME = z.enum(VALID_COUNTRIES_AND_WEIGHTED_TOTAL);

export const VALID_SEARCH_VOLUME_COUNTRIES_SCHEME = z.enum(VALID_COUNTRIES);

export const VALID_PLATFORMS_SCHEME = z.enum([
  "youtube",
  "tiktok",
  "instagram",
  "twitter",
  "youtube_search_term",
  "google",
  "google_growth",
  "url",
  "all_platforms"
]);