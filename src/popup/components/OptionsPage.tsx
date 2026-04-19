import React, { useState, useEffect } from "react";
import { getApiKeys, saveApiKeys } from "@shared/api-keys";

interface OptionsPageProps {
  onSaved?: () => void;
}

export default function OptionsPage({ onSaved }: OptionsPageProps = {}) {
  const [ip2locationKey, setIp2locationKey] = useState("");
  const [electricityMapsKey, setElectricityMapsKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getApiKeys().then((keys) => {
      setIp2locationKey(keys.ip2locationKey);
      setElectricityMapsKey(keys.electricityMapsKey);
    });
  }, []);

  const handleSave = async () => {
    await saveApiKeys({ ip2locationKey, electricityMapsKey });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSaved?.();
    }, 1000);
  };

  return (
    <div className="options-page">
      <h2>API Keys</h2>
      <p>
        CarbonStamp needs two free API keys to estimate carbon footprint.
        Your keys are stored locally and never sent anywhere except the APIs
        themselves.
      </p>

      <div className="key-field">
        <label htmlFor="ip2location-key">
          ip2location.io API Key
        </label>
        <input
          id="ip2location-key"
          type="text"
          value={ip2locationKey}
          onChange={(e) => setIp2locationKey(e.target.value)}
          placeholder="Enter your ip2location.io key"
        />
        <span className="key-help">
          Free at <a href="https://www.ip2location.io/" target="_blank" rel="noreferrer">ip2location.io</a> — 30K requests/month
        </span>
      </div>

      <div className="key-field">
        <label htmlFor="electricity-maps-key">
          Electricity Maps API Key
        </label>
        <input
          id="electricity-maps-key"
          type="text"
          value={electricityMapsKey}
          onChange={(e) => setElectricityMapsKey(e.target.value)}
          placeholder="Enter your Electricity Maps key"
        />
        <span className="key-help">
          Free at <a href="https://api.electricitymap.org/" target="_blank" rel="noreferrer">electricitymap.org</a>
        </span>
      </div>

      <div className="key-field">
        <label>Green Web Foundation</label>
        <span className="key-info">No key required — free unlimited access</span>
      </div>

      <button className="save-button" onClick={handleSave}>
        Save Keys
      </button>

      {saved && <span className="saved-message">Saved!</span>}
    </div>
  );
}
