import { useMemo } from "react";

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  const fixed = value.toFixed(1);
  return `${fixed}%`;
}

function buildSparklinePath(points, width = 260, height = 90, padding = 6) {
  if (!points.length) return "";

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = (width - padding * 2) / (points.length - 1 || 1);

  return points
    .map((point, idx) => {
      const x = padding + idx * step;
      const normalized = (point.value - min) / span;
      const y = height - padding - normalized * (height - padding * 2);
      return `${idx === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function TrendMomentumCard({ data = [], region }) {
  const { momentum, recentChange, sparkPath, highlights } = useMemo(() => {
    if (!data.length) {
      return {
        momentum: null,
        recentChange: null,
        sparkPath: "",
        highlights: [],
      };
    }

    const first = data[0];
    const last = data[data.length - 1];
    const prev = data[data.length - 2];

    const overallChange =
      first && last ? ((last.value - first.value) / first.value) * 100 : null;
    const lastChange =
      prev && last ? ((last.value - prev.value) / prev.value) * 100 : null;

    const sortedByValue = [...data].sort((a, b) => b.value - a.value);
    const highest = sortedByValue[0];
    const lowest = sortedByValue[sortedByValue.length - 1];

    const highlightItems = [
      highest && {
        label: "Peak year",
        value: `${highest.year} • ${highest.value.toFixed(1)} MMT`,
      },
      lowest && {
        label: "Lowest year",
        value: `${lowest.year} • ${lowest.value.toFixed(1)} MMT`,
      },
    ].filter(Boolean);

    return {
      momentum: overallChange,
      recentChange: lastChange,
      sparkPath: buildSparklinePath(data),
      highlights: highlightItems,
    };
  }, [data]);

  return (
    <div className="chart-card trend-card">
      <div className="trend-card-head">
        <div>
          <p className="eyebrow">Trend momentum</p>
          <h3>{region} emissions trajectory</h3>
        </div>
        <div className="trend-pill">
          <span>{formatPercent(momentum)}</span>
          <p>Change vs earliest year</p>
        </div>
      </div>

      <div className="sparkline-wrapper">
        <svg width="100%" height="90" viewBox="0 0 260 90" preserveAspectRatio="none">
          <path d={sparkPath} vectorEffect="non-scaling-stroke" />
        </svg>

      </div>

      <div className="trend-details">
        {highlights.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendMomentumCard;



