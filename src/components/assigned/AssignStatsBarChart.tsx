import { useState } from "react";
import { getAssignStatusSummary, type AssignedTaskRowsByWeek } from "../../lib/assignedTasks";
import type { AssignStatsPeriod } from "../../types";

const periodOptions: Array<{ key: AssignStatsPeriod; label: string }> = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "YTD" },
];

export function AssignStatsBarChart({
  period,
  onPeriodChange,
  rowsByWeek,
}: {
  period: AssignStatsPeriod;
  onPeriodChange: (period: AssignStatsPeriod) => void;
  rowsByWeek: AssignedTaskRowsByWeek;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const summary = getAssignStatusSummary(rowsByWeek, period);
  const stats = [
    { key: "completed", label: "Completed", value: summary.completed, percent: summary.completedPercent },
    { key: "in-progress", label: "In Progress", value: summary.inProgress, percent: summary.inProgressPercent },
    { key: "not-started", label: "Not Started", value: summary.notStarted, percent: summary.notStartedPercent },
  ];

  return (
    <div className="assign-stats-bars" aria-label={`${summary.total} total tasks`}>
      <div className="assign-stats-period-tabs" role="tablist" aria-label="Task status range">
        {periodOptions.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={period === item.key}
            onClick={(event) => {
              event.stopPropagation();
              onPeriodChange(item.key);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        className="assign-stats-stacked-bar"
        onMouseEnter={(event) => setTooltip({ x: event.clientX, y: event.clientY })}
        onMouseMove={(event) => setTooltip({ x: event.clientX, y: event.clientY })}
        onMouseLeave={() => setTooltip(null)}
      >
        {stats.map((item) => (
          <span key={item.key} data-status={item.key} style={{ width: `${item.percent}%` }} />
        ))}
      </div>
      {tooltip && (
        <div className="assign-stats-tooltip" style={{ left: tooltip.x + 14, top: tooltip.y + 14 }} aria-hidden="true">
          <strong>Total: {summary.total}</strong>
          {stats.map((item) => (
            <span data-status={item.key} key={item.key}>
              <i />
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
