import { useTheme } from "../context/ThemeContext.jsx";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function EmissionsVsWeatherChart({ data, region }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartRegion = region || "Selected Region";

  return (
    <div className="chart-card">
      <h2 className="chart-title chart-title-text">
        Emissions vs Temperature by Region{" "}
        <span className="chart-region-badge-orange">({chartRegion})</span>
      </h2>

      <p className="chart-subtitle chart-subtitle-text">
        Estimated emissions index vs measured temperature for {chartRegion} (OpenWeather 7-day forecast).
      </p>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#555" : "#ccc"} />

            <XAxis
              dataKey="date"
              tick={{ fill: isDark ? "white" : "black" }}
              stroke={isDark ? "white" : "black"}
            />

            <YAxis
              yAxisId="left"
              tick={{ fill: isDark ? "white" : "black" }}
              stroke={isDark ? "white" : "black"}
              domain={["dataMin - 10%", "dataMax + 10%"]}
              label={{
                value: "Emissions (index)",
                angle: -90,
                position: "insideLeft",
                fill: isDark ? "white" : "black",
              }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: isDark ? "white" : "black" }}
              stroke={isDark ? "white" : "black"}
              domain={["dataMin - 20%", "dataMax + 20%"]}
              label={{
                value: "Temp (°C)",
                angle: 90,
                position: "insideRight",
                fill: isDark ? "white" : "black",
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#222" : "white",
                color: isDark ? "white" : "black",
                borderColor: isDark ? "#444" : "#ccc",
              }}
            />

            <Legend wrapperStyle={{ color: isDark ? "white" : "black" }} />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="emissions"
              name="Emissions (derived)"
              stroke="#4F46E5"
              strokeWidth={3}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="temperature"
              name="Temperature (°C)"
              stroke="#F97316"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EmissionsVsWeatherChart;
