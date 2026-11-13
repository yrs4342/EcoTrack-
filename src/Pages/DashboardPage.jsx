import { useState, useEffect, useMemo } from "react";
import { useEcoInsights } from "../Hooks/useEcoInsights.js";
import { Link } from "react-router-dom";
import TrendMomentumCard from "../Components/TrendMomentumCard.jsx";

const VALID_REGIONS = ["California", "Texas", "New York", "Florida", "Washington"];
const VALID_TIME_RANGES = ["5y", "10y", "20y"];

function DashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState("California");
  const [timeRange, setTimeRange] = useState("5y");
  const [regionError, setRegionError] = useState("");
  const [timeRangeError, setTimeRangeError] = useState("");

  const handleRegionChange = (e) => {
    const value = e.target.value;
    if (VALID_REGIONS.includes(value)) {
      setSelectedRegion(value);
      setRegionError("");
    } else {
      setRegionError("Please select a valid region");
    }
  };

  const handleTimeRangeChange = (value) => {
    if (VALID_TIME_RANGES.includes(value)) {
      setTimeRange(value);
      setTimeRangeError("");
    } else {
      setTimeRangeError("Please select a valid time range");
    }
  };

  const {
    eiaEmissions,
    emissionsByRegion,
    weatherSeries,
    loading,
    error,
  } = useEcoInsights(selectedRegion, timeRange);

  const latestEmission = eiaEmissions.length > 0 
    ? eiaEmissions[eiaEmissions.length - 1] 
    : null;
  const previousEmission = eiaEmissions.length > 1 
    ? eiaEmissions[eiaEmissions.length - 2] 
    : null;
  
  const emissionChange = latestEmission && previousEmission
    ? ((latestEmission.value - previousEmission.value) / previousEmission.value * 100).toFixed(1)
    : null;

  const averageTemperature = weatherSeries.length > 0
    ? (weatherSeries.reduce((sum, day) => sum + day.temperature, 0) / weatherSeries.length).toFixed(1)
    : null;

  const regionalRanking = useMemo(() => {
    if (emissionsByRegion.length === 0 || !latestEmission) return null;
    
    const sortedRegions = [...emissionsByRegion].sort((a, b) => b.emissions - a.emissions);
    const rank = sortedRegions.findIndex(r => r.region === selectedRegion) + 1;
    const totalRegions = sortedRegions.length;
    const averageEmissions = emissionsByRegion.reduce((sum, r) => sum + r.emissions, 0) / emissionsByRegion.length;
    const avgDifference = Math.abs(((latestEmission.value - averageEmissions) / averageEmissions) * 100).toFixed(1);
    
    return { rank, totalRegions, avgDifference };
  }, [emissionsByRegion, selectedRegion, latestEmission]);

  return (
    <div className="insights-page">
      <header className="insights-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Quick overview of environmental metrics and key insights at a glance.
          </p>
        </div>

        <div className="insights-filters">
          <div className="filter-group">
            <label htmlFor="region-select-dashboard">
              Region (US State) <span className="error-asterisk">*</span>
            </label>
            <select
              id="region-select-dashboard"
              value={selectedRegion}
              onChange={handleRegionChange}
              className={regionError ? "error-input" : ""}
            >
              <option value="">Select a region</option>
              {VALID_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            {regionError && (
              <span className="error-message">
                {regionError}
              </span>
            )}
          </div>


        </div>
      </header>

      {loading && <p className="status-msg">Loading dashboard data...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="dashboard-metrics">
            <div className="metric-card">
              <div className="metric-label">Latest Emissions ({selectedRegion})</div>
              <div className="metric-value">
                {latestEmission ? `${latestEmission.value.toFixed(1)} MMT` : "N/A"}
              </div>
              <div className="metric-year">
                Year: {latestEmission ? latestEmission.year : "N/A"}
              </div>

            </div>

            <div className="metric-card">
              <div className="metric-label">Average Temperature</div>
              <div className="metric-value">
                {averageTemperature ? `${averageTemperature}°C` : "N/A"}
              </div>
              <div className="metric-detail">7-day forecast average</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Regional Ranking ({selectedRegion})</div>
              <div className="metric-value">
                {regionalRanking ? `#${regionalRanking.rank} of ${regionalRanking.totalRegions}` : "N/A"}
              </div>

            </div>

            <div className="metric-card">
              <div className="metric-label">Data Points</div>
              <div className="metric-value">
                {eiaEmissions.length} years
              </div>
              <div className="metric-detail">EIA emissions data</div>
            </div>
          </section>

          <div className="filter-group">
            <span>Time Range <span className="error-asterisk">*</span></span>
            <div className="time-buttons">
              <button
                className={timeRange === "5y" ? "active" : ""}
                onClick={() => handleTimeRangeChange("5y")}
              >
                5 Years
              </button>
              <button
                className={timeRange === "10y" ? "active" : ""}
                onClick={() => handleTimeRangeChange("10y")}
              >
                10 Years
              </button>
              <button
                className={timeRange === "20y" ? "active" : ""}
                onClick={() => handleTimeRangeChange("20y")}
              >
                20 Years
              </button>
            </div>
            {timeRangeError && (
              <span className="error-message">
                {timeRangeError}
              </span>
            )}
          </div>
          <section className="charts-grid trend-grid">
            <TrendMomentumCard data={eiaEmissions} region={selectedRegion} />
          </section>

          <div className="dashboard-link-container">
            <Link to="/insights">
              <button className="cta-button primary large">
                View Detailed Insights →
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;