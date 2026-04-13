/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IP2LOCATION_API_KEY: string;
  readonly VITE_ELECTRICITY_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
