import type { ReactNode } from "react";
import { getAssignedActiveTypes, getAssignedStatusSummary, getAssignedTypeSummary } from "../../lib/assignedTasks";
import type { AssignedTaskRow, ResourceType } from "../../types";

type TypeIconRenderer = (type: ResourceType) => ReactNode;

export function AssignedTaskStatusSummary({ rows }: { rows: AssignedTaskRow[] }) {
  const { completed, inProgress, notStarted } = getAssignedStatusSummary(rows);

  return (
    <em className="assigned-week-status-summary">
      <span data-status="completed">{completed} completed</span>
      <span aria-hidden="true">|</span>
      <span data-status="in-progress">{inProgress} in progress</span>
      <span aria-hidden="true">|</span>
      <span data-status="not-started">{notStarted} not started</span>
    </em>
  );
}

export function AssignedTaskTypeSummary({ rows, renderTypeIcon }: { rows: AssignedTaskRow[]; renderTypeIcon: TypeIconRenderer }) {
  const counts = getAssignedTypeSummary(rows);
  const activeTypes = getAssignedActiveTypes(rows);

  return (
    <span className="assigned-week-type-summary" aria-label={activeTypes.map((resourceType) => `${counts[resourceType]} ${resourceType}`).join(", ")}>
      {activeTypes.map((resourceType) => (
        <span key={resourceType} data-type={resourceType}>
          <strong>{counts[resourceType]}</strong>
          {renderTypeIcon(resourceType)}
        </span>
      ))}
    </span>
  );
}
