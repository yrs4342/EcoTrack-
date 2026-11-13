// src/Hooks/useEcoInsights.js
import { useEffect, useState } from "react";

// Dropdown label -> EIA state code + OpenWeather city
const REGION_CONFIG = {
  California: { stateCode: "CA", cityQuery: "Los Angeles,US" },
  Texas: { stateCode: "TX", cityQuery: "Houston,US" },
  "New York": { stateCode: "NY", cityQuery: "New York,US" },
  Florida: { stateCode: "FL", cityQuery: "Miami,US" },
  Washington: { stateCode: "WA", cityQuery: "Seattle,US" },
};

const REGION_NAMES = Object.keys(REGION_CONFIG);

// How many years to show in EIA chart for each time-range button
function yearsForRange(range) {
  // Accept the exact button values used in the UI: "5y", "10y", "20y"
  switch (range) {
    case "5y":
      return 5; // last 5 years
    case "10y":
      return 10; // last 10 years
    case "20y":
      return 20; // last 20 years
    default:
      // be conservative: default to 5 years if unknown
      return 5;
  }
}

// ---- EIA helpers ----

// Build EMISS series id from state code (pattern from EIA docs)
// Energy-related CO2 emissions, total, all sectors, by state, annual
function buildEiaSeriesId(stateCode) {
  return `EMISS.CO2-TOTV-TT-TO-${stateCode}.A`;
}

// EIA API v2 – using the /v2/seriesid/<V1_SERIES_ID> backward-compat route
async function fetchEiaSeriesForState(stateCode, apiKey) {
  const seriesId = buildEiaSeriesId(stateCode);

  // ✅ API v2 route (v1 /series is retired)
  const url = `https://api.eia.gov/v2/seriesid/${seriesId}?api_key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("EIA error:", await res.text());
    throw new Error("EIA API failed");
  }

  const json = await res.json();

  // Main v2 format: response.data is an array of { period, value, ... }
  if (Array.isArray(json?.response?.data)) {
    const points = json.response.data
      .map((row) => ({
        year: Number(row.period), // e.g., "2022"
        value: Number(row.value), // emission value (usually million metric tons)
      }))
      .sort((a, b) => a.year - b.year); // ascending by year

    return points;
  }

  // Fallback in case some routes still send old-style series.data
  if (Array.isArray(json?.series?.[0]?.data)) {
    const points = json.series[0].data
      .map(([year, value]) => ({
        year: Number(year),
        value: Number(value),
      }))
      .sort((a, b) => a.year - b.year);

    return points;
  }

  console.error("Unexpected EIA response format:", json);
  throw new Error("EIA data missing");
}

// OpenWeather helper

async function fetchWeatherSeries(cityQuery, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityQuery}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("OpenWeather error:", await res.text());
    throw new Error("Weather API failed");
  }

  const json = await res.json();
  const list = json.list || [];

  // Take first 7 forecast points
  const slice = list.slice(0, 7);

  return slice.map((item, idx) => {
    const temp = item.main.temp;
    return {
      date: `Day ${idx + 1}`,
      temperature: temp, // real °C from API
      // visual-only emissions index derived from temp (NO hard-coded dataset)
      emissions: Math.round((temp + 20) * 3),
    };
  });
}

// Hook

export function useEcoInsights(region, timeRange) {
  const [eiaEmissions, setEiaEmissions] = useState([]);        // EIA time-series (selected state)
  const [emissionsByRegion, setEmissionsByRegion] = useState([]); // EIA latest snapshot for all states
  const [emissionsByRegionHistorical, setEmissionsByRegionHistorical] = useState([]); // EIA time-series for all states
  const [weatherSeries, setWeatherSeries] = useState([]);      // OpenWeather daily series
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const regionConfig = REGION_CONFIG[region];
        if (!regionConfig) throw new Error("Unsupported region");

        const eiaKey =
          import.meta.env.VITE_EIA_API_KEY || "YOUR_EIA_KEY_HERE";
        const weatherKey =
          import.meta.env.VITE_OPENWEATHER_API_KEY || "YOUR_OPENWEATHER_KEY_HERE";

        const yearsToShow = yearsForRange(timeRange);

        // Fetch in parallel:
        // - EIA series for selected state
        // - Weather for selected state
        // - EIA latest values for all states (for comparison bar chart)
        // - EIA historical series for all states (for multi-year comparison)
        const [selectedEiaSeries, weatherData, regionalSnapshot, regionalHistorical] =
          await Promise.all([
            // EIA series for selected region
            (async () => {
              const full = await fetchEiaSeriesForState(
                regionConfig.stateCode,
                eiaKey
              );
              // If full is shorter than requested, return all available
              if (!full || full.length === 0) return [];
              return yearsToShow >= full.length ? full : full.slice(-yearsToShow);
            })(),

            // Weather for selected region
            fetchWeatherSeries(regionConfig.cityQuery, weatherKey),

            // EIA latest for all regions (snapshot for bar chart)
            (async () => {
              const promises = REGION_NAMES.map(async (name) => {
                const cfg = REGION_CONFIG[name];
                const full = await fetchEiaSeriesForState(
                  cfg.stateCode,
                  eiaKey
                );
                const latest = full && full.length ? full[full.length - 1] : null;
                return {
                  region: name,
                  emissions: latest ? latest.value : 0,
                };
              });

              // filter out any that failed / returned 0
              return (await Promise.all(promises)).filter(
                (r) => r.emissions !== 0
              );
            })(),

            // EIA historical series for all regions (for multi-year comparison)
            (async () => {
              const promises = REGION_NAMES.map(async (name) => {
                const cfg = REGION_CONFIG[name];
                try {
                  const full = await fetchEiaSeriesForState(
                    cfg.stateCode,
                    eiaKey
                  );
                  if (!full || full.length === 0) return null;
                  // Return historical data for the selected time range
                  const historical = yearsToShow >= full.length 
                    ? full 
                    : full.slice(-yearsToShow);
                  return {
                    region: name,
                    data: historical,
                  };
                } catch (err) {
                  console.error(`Failed to fetch historical data for ${name}:`, err);
                  return null;
                }
              });

              // filter out any that failed
              return (await Promise.all(promises)).filter((r) => r !== null && r.data && r.data.length > 0);
            })(),
          ]);

        setEiaEmissions(selectedEiaSeries);
        setWeatherSeries(weatherData);
        setEmissionsByRegion(regionalSnapshot);
        setEmissionsByRegionHistorical(regionalHistorical);
      } catch (err) {
        console.error(err);
        setError("Failed to load insights data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [region, timeRange]);

  return {
    eiaEmissions,      // for "Annual CO₂ Emissions (EIA)" line chart
    emissionsByRegion, // for "Emissions by Region" bar chart (latest snapshot)
    emissionsByRegionHistorical, // for "Emissions by Region" multi-year comparison
    weatherSeries,     // for "Emissions vs Temperature" chart
    loading,
    error,
  };
}
