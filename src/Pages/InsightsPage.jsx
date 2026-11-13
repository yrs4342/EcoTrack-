import { useState, useMemo } from "react";
import { useEcoInsights } from "../Hooks/useEcoInsights.js";
import EmissionsOverTimeChart from "../Components/EmissionsOverTimeChart.jsx";
import EmissionsVsWeatherChart from "../Components/EmissionsVsWeatherChart.jsx";

function InsightsPage() {
  const [selectedRegion, setSelectedRegion] = useState("California");
  const [timeRange, setTimeRange] = useState("5y");

  const {
    eiaEmissions,
    emissionsByRegion,
    weatherSeries,
    loading,
    error,
  } = useEcoInsights(selectedRegion, timeRange);
  const latestEiaYear =
    eiaEmissions.length > 0
      ? eiaEmissions[eiaEmissions.length - 1].year
      : "N/A";

  const latestEmission = eiaEmissions.length > 0
    ? eiaEmissions[eiaEmissions.length - 1]
    : null;

  const regionalRanking = useMemo(() => {
    if (emissionsByRegion.length === 0 || !latestEmission) return null;

    const sortedRegions = [...emissionsByRegion].sort((a, b) => b.emissions - a.emissions);
    const rank = sortedRegions.findIndex(r => r.region === selectedRegion) + 1;
    const totalRegions = sortedRegions.length;
    const averageEmissions = emissionsByRegion.reduce((sum, r) => sum + r.emissions, 0) / emissionsByRegion.length;
    const vsAverage = latestEmission.value > averageEmissions ? 'above' : 'below';
    const avgDifference = Math.abs(((latestEmission.value - averageEmissions) / averageEmissions) * 100).toFixed(1);

    return { rank, totalRegions, vsAverage, avgDifference };
  }, [emissionsByRegion, selectedRegion, latestEmission]);

  return (
    <div className="insights-page">
      <header className="insights-header">
        <div>
          <h1>Insights & Trends</h1>
          <p>
            Visualize how carbon emissions and environmental factors change over
            time so you can make smarter, sustainable decisions.
          </p>
        </div>

        <div className="insights-filters">
          <div className="filter-group">
            <label htmlFor="region-select">Region (US State)</label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="California">California</option>
              <option value="Texas">Texas</option>
              <option value="New York">New York</option>
              <option value="Florida">Florida</option>
              <option value="Washington">Washington</option>
            </select>
          </div>

          <div className="filter-group">
            <span>Time Range</span>
            <div className="time-buttons">
              <button
                className={timeRange === "5y" ? "active" : ""}
                onClick={() => setTimeRange("5y")}
              >
                5 Years
              </button>
              <button
                className={timeRange === "10y" ? "active" : ""}
                onClick={() => setTimeRange("10y")}
              >
                10 Years
              </button>
              <button
                className={timeRange === "20y" ? "active" : ""}
                onClick={() => setTimeRange("20y")}
              >
                20 Years
              </button>
            </div>
          </div>
        </div>
      </header>

      {loading && <p className="status-msg">Loading insights...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="charts-grid">
            <EmissionsOverTimeChart
              data={eiaEmissions}
              region={selectedRegion}
            />
          </section>

          <section className="charts-grid">
            <EmissionsVsWeatherChart
              data={weatherSeries}
              region={selectedRegion}
            />
          </section>

          <section className="insights-summary">
            <h3>Quick Summary</h3>
            <ul>
              <li>
                The most recent emissions data for{" "}
                <strong>{selectedRegion}</strong> is from{" "}
                <strong>{latestEiaYear}</strong>, based on the U.S. EIA EMISS
                dataset.
              </li>
              {regionalRanking && (
                <li>
                  <strong>{selectedRegion}</strong> ranks{" "}
                  <strong>#{regionalRanking.rank} out of {regionalRanking.totalRegions}</strong> regions, with emissions{" "}
                  <strong>{regionalRanking.vsAverage === 'above' ? 'above' : 'below'}</strong> the regional average by{" "}
                  <strong>{regionalRanking.avgDifference}%</strong>.
                </li>
              )}
              <li>
                Over the 7-day forecast window,{" "}
                <strong>temperature (OpenWeather)</strong> and the derived
                emissions index correlate closely.
              </li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default InsightsPage;