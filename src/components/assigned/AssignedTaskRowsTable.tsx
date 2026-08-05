import type { MouseEvent, ReactNode } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  getAssignedCompletionDetail,
  getAssignedRowMeta,
  getAssignedRowResourceType,
  getAssignedTaskOperation,
} from "../../lib/assignedTasks";
import type { AssignedCompletionDetail, AssignedTaskRow, ResourceType } from "../../types";

type TypeIconRenderer = (type: ResourceType) => ReactNode;

export function AssignedTaskRowsTable({
  rows,
  showStudent,
  renderTypeIcon,
  onCompletionHover,
  onCompletionLeave,
  onFeedback,
}: {
  rows: AssignedTaskRow[];
  showStudent: boolean;
  renderTypeIcon: TypeIconRenderer;
  onCompletionHover: (event: MouseEvent<HTMLElement>, detail: AssignedCompletionDetail) => void;
  onCompletionLeave: () => void;
  onFeedback: (row: AssignedTaskRow) => void;
}) {
  return (
    <div className="assigned-task-table" data-show-student={showStudent} role="table" aria-label="Assigned task list">
      <div className="assigned-task-table-head" role="row">
        <span role="columnheader">Task Info</span>
        {showStudent && <span role="columnheader">Student</span>}
        <span role="columnheader">Completion</span>
        <span role="columnheader">Operation</span>
      </div>
      {rows.map((row) => {
        const completionDetail = getAssignedCompletionDetail(row);
        const operation = getAssignedTaskOperation(row);
        const resourceType = getAssignedRowResourceType(row.taskType);

        return (
          <div className="assigned-task-table-row" role="row" key={`${row.sentAt}-${row.recipient}-${row.taskName}`}>
            <div className="assigned-task-info-cell" role="cell" data-type={resourceType}>
              <strong className="assigned-task-name">
                <span>{row.taskName}</span>
              </strong>
              <span className="assigned-task-meta">
                {renderTypeIcon(resourceType)}
                {getAssignedRowMeta(row)}
              </span>
            </div>
            {showStudent && <span className="assigned-task-student-name" role="cell">{row.recipient}</span>}
            <span className="assigned-task-completion-cell" role="cell">
              <Badge variant="secondary" className="assigned-task-status" data-status={row.status}>
                {row.status}
              </Badge>
              {completionDetail ? (
                <strong
                  className="assigned-task-score"
                  onMouseEnter={(event) => onCompletionHover(event, completionDetail)}
                  onMouseMove={(event) => onCompletionHover(event, completionDetail)}
                  onMouseLeave={onCompletionLeave}
                >
                  {completionDetail.label}
                </strong>
              ) : (
                <span className="assigned-task-no-score">-</span>
              )}
            </span>
            <span className="assigned-task-operation-cell" role="cell">
              {operation ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="assigned-task-operation-button"
                  onClick={() => {
                    if (operation === "Feedback") onFeedback(row);
                  }}
                >
                  {operation}
                </Button>
              ) : (
                <span className="assigned-task-no-score">-</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
