import React, { useEffect, useState } from "react";
import { hasApiKeys } from "@shared/api-keys";
import { useStorageData } from "./hooks/useStorage";
import OptionsPage from "./components/OptionsPage";
import ScoreCard from "./components/ScoreCard";
import Dashboard from "./components/Dashboard";
import TopSitesChart from "./components/TopSitesChart";
import AnnualEstimate from "./components/AnnualEstimate";
import ExportButton from "./components/ExportButton";

type View = "current" | "dashboard" | "settings";

export default function App() {
  const [keysConfigured, setKeysConfigured] = useState<boolean | null>(null);
  const [view, setView] = useState<View>("current");
  const storage = useStorageData();

  useEffect(() => {
    hasApiKeys().then(setKeysConfigured);
  }, [view]);

  if (keysConfigured === null || storage.loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!keysConfigured || view === "settings") {
    return (
      <div className="app">
        <header className="app-header">
          <h1>CarbonStamp</h1>
          {keysConfigured && (
            <button className="back-button" onClick={() => setView("current")}>
              Back
            </button>
          )}
        </header>
        {!keysConfigured && (
          <div className="setup-banner">
            <strong>Setup required — bring your own API keys</strong>
            <p>
              CarbonStamp needs two free API keys before it can analyse pages.
              Sign up below (takes about 2 minutes), paste your keys here, and
              you're done. Your keys are stored locally and never leave your
              browser.
            </p>
          </div>
        )}
        <OptionsPage
          onSaved={() => {
            setView("current");
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
          className="icon-button"
          onClick={() => setView("settings")}
          title="Settings"
        >
          &#9881;
        </button>
      </header>

      <nav className="tab-bar">
        <button
          className={view === "current" ? "tab active" : "tab"}
          onClick={() => setView("current")}
        >
          This Page
        </button>
        <button
          className={view === "dashboard" ? "tab active" : "tab"}
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>
      </nav>

      {view === "current" && (
        <div className="view-current">
          {storage.currentPage ? (
            <>
              <div className="current-domain">{storage.currentPage.domain}</div>
              <ScoreCard
                grade={storage.currentPage.result.grade}
                co2Grams={storage.currentPage.result.co2_grams}
                transferKb={storage.currentPage.result.transfer_kb}
                energyKwh={
                  (storage.currentPage.result.transfer_kb * 1024) /
                  1_073_741_824 *
                  0.81
                }
                greenHost={storage.currentPage.result.green_host}
                percentileText={`Visited ${storage.currentPage.result.visits} time${storage.currentPage.result.visits === 1 ? "" : "s"} today`}
              />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">&#127758;</div>
              <h3>No data yet</h3>
              <p>Navigate to a webpage and CarbonStamp will analyse its carbon footprint automatically.</p>
            </div>
          )}
        </div>
      )}

      {view === "dashboard" && (
        <div className="view-dashboard">
          {storage.totalPages > 0 ? (
            <>
              <Dashboard dailyTotals={storage.dailyTotals} />
              {storage.topSites.length > 0 && (
                <section className="section">
                  <h3 className="section-title">Heaviest Sites</h3>
                  <TopSitesChart sites={storage.topSites} />
                </section>
              )}
              {storage.daysOfData >= 1 && (
                <section className="section">
                  <AnnualEstimate
                    totalCo2Grams={storage.totalCo2Grams}
                    daysOfData={storage.daysOfData}
                  />
                </section>
              )}
              <section className="section export-section">
                <ExportButton
                  totalCo2Grams={storage.totalCo2Grams}
                  pageCount={storage.totalPages}
                  daysOfData={storage.daysOfData}
                  topSites={storage.topSites}
                  gradeDistribution={storage.gradeDistribution}
                />
              </section>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">&#128202;</div>
              <h3>No history yet</h3>
              <p>Browse some pages and your carbon footprint data will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
