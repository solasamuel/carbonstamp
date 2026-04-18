import React, { useState } from "react";

export interface DevResource {
  name: string;
  initiatorType: string;
  transferSize: number;
  decodedBodySize: number;
  protocol?: string;
  encodingUsed?: boolean;
  isRenderBlocking?: boolean;
  isCdn?: boolean;
}

export type FlagType = "uncompressed" | "render-blocking" | "no-http2" | "no-cdn";

export interface ResourceFlag {
  resource: string;
  type: FlagType;
  message: string;
  estimatedSavingKb?: number;
}

export function analyseResources(resources: DevResource[]): ResourceFlag[] {
  const flags: ResourceFlag[] = [];

  for (const r of resources) {
    const filename = r.name.split("/").pop() ?? r.name;

    // Flag uncompressed images
    if (
      r.initiatorType === "img" &&
      !r.encodingUsed &&
      r.decodedBodySize > r.transferSize * 0.9
    ) {
      const potentialSaving = r.transferSize * 0.6; // ~60% compression typical
      flags.push({
        resource: r.name,
        type: "uncompressed",
        message: `${filename} is uncompressed — could save ~${Math.round(potentialSaving / 1024)} KB`,
        estimatedSavingKb: Math.round(potentialSaving / 1024),
      });
    }

    // Flag render-blocking scripts
    if (r.initiatorType === "script" && r.isRenderBlocking) {
      flags.push({
        resource: r.name,
        type: "render-blocking",
        message: `${filename} is render-blocking — consider async/defer`,
      });
    }

    // Flag no HTTP/2
    if (r.protocol && !r.protocol.startsWith("h2") && !r.protocol.startsWith("h3")) {
      flags.push({
        resource: r.name,
        type: "no-http2",
        message: `${filename} served over ${r.protocol} — HTTP/2 recommended`,
      });
    }

    // Flag no CDN
    if (!r.isCdn && (r.initiatorType === "script" || r.initiatorType === "img")) {
      flags.push({
        resource: r.name,
        type: "no-cdn",
        message: `${filename} not served via CDN`,
      });
    }
  }

  return flags;
}

interface DevModeProps {
  resources: DevResource[];
}

export default function DevMode({ resources }: DevModeProps) {
  const [enabled, setEnabled] = useState(false);
  const flags = analyseResources(resources);
  const totalSaving = flags.reduce(
    (sum, f) => sum + (f.estimatedSavingKb ?? 0),
    0
  );

  return (
    <div className="dev-mode">
      <button
        className="dev-mode-toggle"
        onClick={() => setEnabled(!enabled)}
      >
        {enabled ? "Hide Developer Mode" : "Developer Mode"}
      </button>

      {enabled && (
        <div className="dev-mode-content">
          <div className="resource-list">
            {resources.map((r, i) => {
              const filename = r.name.split("/").pop() ?? r.name;
              const resourceFlags = flags.filter((f) => f.resource === r.name);
              return (
                <div key={i} className="resource-item">
                  <div className="resource-header">
                    <span className="resource-name">{filename}</span>
                    <span className="resource-type">{r.initiatorType}</span>
                    <span className="resource-size">
                      {Math.round(r.transferSize / 1024)} KB
                    </span>
                    {r.protocol && (
                      <span className="resource-protocol">{r.protocol}</span>
                    )}
                  </div>
                  {resourceFlags.length > 0 && (
                    <div className="resource-flags">
                      {resourceFlags.map((flag, j) => (
                        <span key={j} className={`flag flag-${flag.type}`}>
                          {flag.message}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalSaving > 0 && (
            <div className="total-saving">
              Estimated total saving: ~{totalSaving} KB
            </div>
          )}
        </div>
      )}
    </div>
  );
}
