export type ResourceCategory = "image" | "script" | "css" | "font" | "other";

const FONT_EXTENSIONS = [".woff", ".woff2", ".ttf", ".otf", ".eot"];
const CSS_EXTENSIONS = [".css"];

export function categoriseResource(
  initiatorType: string,
  url?: string
): ResourceCategory {
  switch (initiatorType) {
    case "img":
      return "image";
    case "script":
      return "script";
    case "css":
      return "css";
    case "font":
      return "font";
    case "link": {
      if (url) {
        const path = url.split("?")[0].toLowerCase();
        if (FONT_EXTENSIONS.some((ext) => path.endsWith(ext))) return "font";
        if (CSS_EXTENSIONS.some((ext) => path.endsWith(ext))) return "css";
      }
      return "other";
    }
    default:
      return "other";
  }
}

interface RawResourceEntry {
  name: string;
  initiatorType: string;
  transferSize: number;
  decodedBodySize: number;
}

export interface CategorisedResource {
  name: string;
  initiatorType: string;
  transferSize: number;
  decodedBodySize: number;
  category: ResourceCategory;
}

export interface PageResourcesPayload {
  type: "PAGE_RESOURCES";
  domain: string;
  resources: CategorisedResource[];
  totalTransferSize: number;
}

export function buildPayload(
  domain: string,
  entries: RawResourceEntry[]
): PageResourcesPayload {
  const resources: CategorisedResource[] = entries.map((entry) => ({
    ...entry,
    category: categoriseResource(entry.initiatorType, entry.name),
  }));

  const totalTransferSize = resources.reduce(
    (sum, r) => sum + r.transferSize,
    0
  );

  return {
    type: "PAGE_RESOURCES",
    domain,
    resources,
    totalTransferSize,
  };
}
