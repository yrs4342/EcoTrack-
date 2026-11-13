import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function EmissionsOverTimeChart({ data = [], region = "Unknown" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const ticks = data.map((d) => d.year);
  const yFormatter = (v) =>
    Number.isInteger(v) ? `${v}` : v.toFixed(1);

  return (
    <div className="chart-card">
      <h2 className="chart-title-text">
        CO₂ Emissions Over Time{" "}
        <span className="chart-region-badge">({region})</span>
      </h2>

      <p className="chart-subtitle chart-subtitle-text">
        Annual energy-related CO₂ emissions (EIA). Showing {data.length} years.
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 18, left: 8, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#555" : "#ccc"}
          />

          <XAxis
            dataKey="year"
            ticks={ticks}
            interval={0}
            tick={{
              fontSize: 10,
              angle: -45,
              textAnchor: "end",
              fill: isDark ? "white" : "black",
            }}
            stroke={isDark ? "white" : "black"}
            height={50}
          />

          <YAxis
            unit=" MtCO₂"
            tick={{ fontSize: 11, fill: isDark ? "white" : "black" }}
            tickFormatter={yFormatter}
            width={72}
            stroke={isDark ? "white" : "black"}
            domain={["auto", "auto"]}
          />

          <Tooltip
            formatter={(value) => [Number(value).toFixed(2), "MMT CO₂"]}
            labelFormatter={(label) => `Year: ${label}`}
            contentStyle={{
              backgroundColor: isDark ? "#222" : "white",
              color: isDark ? "white" : "black",
              borderColor: isDark ? "#444" : "#ccc",
            }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EmissionsOverTimeChart;
