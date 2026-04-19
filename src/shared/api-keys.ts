export interface ApiKeys {
  ip2locationKey: string;
  electricityMapsKey: string;
}

const STORAGE_KEY = "apiKeys";

const DEFAULT_KEYS: ApiKeys = {
  ip2locationKey: "",
  electricityMapsKey: "",
};

export async function getApiKeys(): Promise<ApiKeys> {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  return (result[STORAGE_KEY] as ApiKeys) ?? DEFAULT_KEYS;
}

export async function saveApiKeys(keys: ApiKeys): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: keys });
}

export async function hasApiKeys(): Promise<boolean> {
  const keys = await getApiKeys();
  return keys.ip2locationKey.length > 0 && keys.electricityMapsKey.length > 0;
}
