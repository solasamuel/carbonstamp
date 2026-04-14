import {
  ENERGY_PER_GB_KWH,
  RETURNING_VISITOR_FACTOR,
  GLOBAL_AVERAGE_INTENSITY,
} from "@shared/constants";

export interface CarbonInput {
  transferSizeBytes: number;
  carbonIntensity: number;
  isGreenHost: boolean;
  isReturningVisitor: boolean;
}

export interface CarbonResult {
  co2_grams: number;
  energy_kwh: number;
  transfer_kb: number;
}

/**
 * Implements the websitecarbon.com open methodology:
 *
 * co2_grams = (data_gb × 0.81 × visitor_factor × carbon_intensity)
 *           + (data_gb × 0.52 × 0.25 × 442)
 *
 * Green hosting zeroes out the data centre (first) component.
 * Returning visitor adjustment applies 0.75× to the network component.
 */
export function calculateCarbon(input: CarbonInput): CarbonResult {
  const { transferSizeBytes, carbonIntensity, isGreenHost, isReturningVisitor } =
    input;

  const dataGb = transferSizeBytes / 1_073_741_824;
  const visitorFactor = isReturningVisitor ? RETURNING_VISITOR_FACTOR : 1.0;

  // Network + data centre component (zeroed for green hosts)
  const networkComponent = isGreenHost
    ? 0
    : dataGb * ENERGY_PER_GB_KWH * visitorFactor * carbonIntensity;

  // End-user device component (always present, uses global average)
  const endUserComponent = dataGb * 0.52 * 0.25 * GLOBAL_AVERAGE_INTENSITY;

  const co2Grams = networkComponent + endUserComponent;
  const energyKwh = dataGb * ENERGY_PER_GB_KWH;
  const transferKb = transferSizeBytes / 1024;

  return {
    co2_grams: co2Grams,
    energy_kwh: energyKwh,
    transfer_kb: transferKb,
  };
}
