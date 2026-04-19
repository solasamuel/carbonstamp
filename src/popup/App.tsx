import React, { useEffect, useState } from "react";
import { hasApiKeys } from "@shared/api-keys";
import OptionsPage from "./components/OptionsPage";

export default function App() {
  const [keysConfigured, setKeysConfigured] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    hasApiKeys().then(setKeysConfigured);
  }, [showSettings]);

  if (keysConfigured === null) {
    return <div className="loading">Loading...</div>;
  }

  if (!keysConfigured || showSettings) {
    return (
      <div className="app">
        <h1>CarbonStamp</h1>
        {!keysConfigured && (
          <div className="setup-required">
            <p>
              Set up your free API keys to start estimating your browsing
              carbon footprint.
            </p>
          </div>
        )}
        <OptionsPage
          onSaved={() => {
            setShowSettings(false);
            setKeysConfigured(null);
            hasApiKeys().then(setKeysConfigured);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>CarbonStamp</h1>
        <button
          className="settings-button"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
      </header>
      <p>Webpage Carbon Footprint Estimator</p>
    </div>
  );
}
