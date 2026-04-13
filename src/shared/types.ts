export type Grade = "A+" | "A" | "B" | "C" | "D" | "F";

export interface PageResult {
  grade: Grade;
  co2_grams: number;
  transfer_kb: number;
  visits: number;
  green_host: boolean;
}

export interface DailyTotal {
  total_co2_grams: number;
  page_count: number;
}

export interface GeoCache {
  country: string;
  carbon_intensity: number;
  expires_at: number;
}

export interface GreenCache {
  is_green: boolean;
  expires_at: number;
}

export interface ResourceEntry {
  name: string;
  initiatorType: string;
  transferSize: number;
  decodedBodySize: number;
}
