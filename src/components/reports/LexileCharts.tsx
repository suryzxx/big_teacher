import type { ReportTrendPoint } from "@/types";

export type { ReportTrendPoint } from "@/types";

export function StudentReportLineChart({
  label,
  unit,
  data,
  classAverageData,
}: {
  label: string;
  unit: string;
  data: ReportTrendPoint[];
  classAverageData: ReportTrendPoint[];
}) {
  const width = 360;
  const height = 210;
  const padding = { top: 28, right: 24, bottom: 34, left: 46 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = [...data.map((item) => item.value), ...classAverageData.map((item) => item.value)];
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);
  const tickBase = maxValue > 1000 ? 100 : maxValue > 100 ? 10 : 1;
  const yMin = Math.max(0, Math.floor((minValue - range * 0.18) / tickBase) * tickBase);
  const yMax = Math.ceil((maxValue + range * 0.18) / tickBase) * tickBase;
  const yRange = Math.max(1, yMax - yMin);
  const xFor = (index: number) => padding.left + (chartWidth / (data.length - 1)) * index;
  const yFor = (value: number) => padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;
  const points = data.map((item, index) => ({ ...item, x: xFor(index), y: yFor(item.value) }));
  const classAveragePoints = classAverageData.map((item, index) => ({ ...item, x: xFor(index), y: yFor(item.value) }));
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  const classAveragePointString = classAveragePoints.map((point) => `${point.x},${point.y}`).join(" ");
  const ticks = [yMin, Math.round((yMin + yMax) / 2), yMax];

  return (
    <div className="student-report-chart">
      <div className="student-report-chart-head">
        <span>{label}</span>
        <em>{unit}</em>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} trend`}>
        {ticks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="student-report-grid-line" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="student-report-tick">
                {tick.toLocaleString()}
              </text>
            </g>
          );
        })}
        <polyline points={classAveragePointString} className="student-report-line student-report-class-line" />
        <polyline points={pointString} className="student-report-line" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4.5" className="student-report-point" />
            <text x={point.x} y={point.y - 10} textAnchor="middle" className="student-report-value">
              {point.value.toLocaleString()}
            </text>
            <text x={point.x} y={height - 12} textAnchor="middle" className="student-report-label">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="student-report-chart-legend" aria-hidden="true">
        <span data-line="student">Current Student</span>
        <span data-line="class">Class Average</span>
      </div>
    </div>
  );
}
