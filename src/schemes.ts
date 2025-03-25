import { z } from 'zod';

export const VALID_COUNTRIES_SCHEME = z.enum([
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
]);

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