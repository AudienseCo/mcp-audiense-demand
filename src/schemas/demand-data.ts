import { z } from "zod";

// Common schema for all demand data files
export const DemandDataSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the entity"),
  name: z.string().describe("Entity name (e.g., 'Angelina Jolie')"),
  reference: z.string().describe("Reference identifier (e.g., 'angelinajolie')"),
  term: z.string().describe("Search term or username (e.g., 'angelinajolie')"),
  platform: z.enum(["instagram", "google", "twitter", "youtube", "tiktok", "url"]).describe("Platform name"),
  segment: z.string().describe("Geographic segment (e.g., 'Global', 'US', 'GB')"),
  variable: z.string().describe("Metric type (e.g., 'Engagement Rate', 'Followers', 'Male Followers', 'Female Followers', 'Avg Search Volume L12M', 'Avg Search Variance YoY', 'Search Volume', 'Followers Age', 'Male Followers Age', 'Female Followers Age')"),
  value: z.union([z.string(), z.number()]).describe("The actual value for the metric"),
  absolute: z.number().describe("Absolute value (typically 1 for rates)"),
  weight: z.number().describe("Weighting factor"),
  timestamp: z.string().datetime().describe("Data collection timestamp")
});

// Schema for Instagram-specific metrics
export const InstagramMetrics = z.enum([
  "Followers",
  "Male Followers",
  "Female Followers",
  "Followers Age",
  "Male Followers Age",
  "Female Followers Age",
  "Engagement Rate"
]).describe("Valid metrics for Instagram data");

// Schema for Google-specific metrics
export const GoogleMetrics = z.enum([
  "Search Volume",
  "Avg Search Volume L12M",
  "Avg Search Variance YoY"
]).describe("Valid metrics for Google data");

// Schema for YouTube-specific metrics
export const YouTubeMetrics = z.enum([
  "Followers",
  "Male Followers",
  "Female Followers",
  "Followers Age",
  "Male Followers Age",
  "Female Followers Age",
  "Engagement Rate"
]).describe("Valid metrics for YouTube data");

// Example usage in TypeScript:
export type DemandData = z.infer<typeof DemandDataSchema>;
export type InstagramMetric = z.infer<typeof InstagramMetrics>;
export type GoogleMetric = z.infer<typeof GoogleMetrics>;
export type YouTubeMetric = z.infer<typeof YouTubeMetrics>;

// Documentation for CSV structure
export const CSV_STRUCTURE = {
  description: "CSV file structure for demand data files",
  columns: [
    { name: "id", description: "Unique identifier for the entity (UUID)" },
    { name: "name", description: "Entity name" },
    { name: "reference", description: "Reference identifier" },
    { name: "term", description: "Search term or username" },
    { name: "platform", description: "Platform name (instagram, google, etc.)" },
    { name: "segment", description: "Geographic segment (Global, US, GB, etc.)" },
    { name: "variable", description: "Metric type (Engagement Rate, Followers, etc.)" },
    { name: "value", description: "The actual value for the metric" },
    { name: "absolute", description: "Absolute value (typically 1 for rates)" },
    { name: "weight", description: "Weighting factor" },
    { name: "timestamp", description: "Data collection timestamp (ISO format)" }
  ],
  example: `id,name,reference,term,platform,segment,variable,value,absolute,weight,timestamp
b83eadf8-4908-4c65-ad20-9e95cc60c7c8,Angelina Jolie,angelinajolie,angelinajolie,instagram,Global,Engagement Rate,0.053962,1,1,2025-03-20 11:46:23
b83eadf8-4908-4c65-ad20-9e95cc60c7c8,Angelina Jolie,angelinajolie,angelinajolie,instagram,US,Followers,1196116,0.07800394481690905,1,2025-03-20 11:46:23`
};