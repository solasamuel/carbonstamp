export const ENV = {
  IP2LOCATION_API_KEY: import.meta.env.VITE_IP2LOCATION_API_KEY as string,
  ELECTRICITY_MAPS_API_KEY: import.meta.env.VITE_ELECTRICITY_MAPS_API_KEY as
    string,
} as const;

export function validateEnv(): void {
  const missing: string[] = [];
  if (!ENV.IP2LOCATION_API_KEY || ENV.IP2LOCATION_API_KEY === "your_key_here") {
    missing.push("VITE_IP2LOCATION_API_KEY");
  }
  if (
    !ENV.ELECTRICITY_MAPS_API_KEY ||
    ENV.ELECTRICITY_MAPS_API_KEY === "your_key_here"
  ) {
    missing.push("VITE_ELECTRICITY_MAPS_API_KEY");
  }
  if (missing.length > 0) {
    console.warn(
      `[CarbonStamp] Missing API keys: ${missing.join(", ")}. Copy .env.example to .env and add your keys.`
    );
  }
}
