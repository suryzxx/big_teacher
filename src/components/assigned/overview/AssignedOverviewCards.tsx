import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AssignedTaskRow, AssignStatsPeriod, MyClassSummaryCardData } from "@/types";
import { AssignStatsBarChart } from "../AssignStatsBarChart";

export function AssignedTaskSummaryCard({
  period: controlledPeriod,
  onPeriodChange,
  rowsByWeek,
}: {
  period?: AssignStatsPeriod;
  onPeriodChange?: (period: AssignStatsPeriod) => void;
  rowsByWeek: Record<string, AssignedTaskRow[]>;
}) {
  const [internalPeriod, setInternalPeriod] = useState<AssignStatsPeriod>("week");
  const period = controlledPeriod ?? internalPeriod;

  function changePeriod(nextPeriod: AssignStatsPeriod) {
    setInternalPeriod(nextPeriod);
    onPeriodChange?.(nextPeriod);
  }

  return (
    <div className="assigned-task-summary-card" aria-label="Task status summary">
      <AssignStatsBarChart period={period} onPeriodChange={changePeriod} rowsByWeek={rowsByWeek} />
    </div>
  );
}

export function MyClassSummaryCard<Key extends string>({
  section,
  isActive,
  onSelect,
}: {
  section: MyClassSummaryCardData<Key>;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      className="myclass-summary-card"
      data-active={isActive}
      data-tone={section.tone}
      onClick={onSelect}
    >
      <span className="myclass-summary-icon" aria-hidden="true">
        <img src={section.iconImage} alt="" aria-hidden="true" />
      </span>
      <span className="myclass-summary-copy">
        <span>{section.title}</span>
        <strong>{section.primary}</strong>
        {(section.secondary || section.detail) && (
          <small>
            {section.secondary}
            {section.detail && <em>{section.detail}</em>}
          </small>
        )}
      </span>
    </Button>
  );
}
