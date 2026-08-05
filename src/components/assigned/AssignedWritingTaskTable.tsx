import type { ReactNode } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { getAssignedRowMeta, getAssignedRowWritingResult } from "../../lib/assignedTasks";
import type { AssignedTaskRow } from "../../types";

export function AssignedWritingTaskTable({
  rows,
  renderTypeIcon,
}: {
  rows: AssignedTaskRow[];
  renderTypeIcon: () => ReactNode;
}) {
  const taskRow = rows[0];

  return (
    <div className="assigned-writing-task-panel">
      <div className="assigned-writing-task-info" data-type="Writing">
        {renderTypeIcon()}
        <div className="assigned-writing-task-copy">
          <strong>{taskRow.taskName}</strong>
          <span>{getAssignedRowMeta(taskRow)}</span>
        </div>
        <div className="assigned-writing-task-actions">
          <em>{rows.length} students</em>
          <Button type="button" variant="outline" size="sm" className="assigned-writing-discussion-button">
            Discussion
          </Button>
        </div>
      </div>
      <div className="assigned-task-table assigned-writing-task-table" role="table" aria-label="Assigned writing task list">
        <div className="assigned-task-table-head" role="row">
          <span role="columnheader">Student</span>
          <span role="columnheader">Completion</span>
          <span role="columnheader">Writing Words</span>
          <span role="columnheader">Writing Score</span>
          <span role="columnheader">Versions</span>
        </div>
        {rows.map((row) => {
          const writingResult = getAssignedRowWritingResult(row);
          const hasWritingData = row.status !== "Not Started";

          return (
            <div className="assigned-task-table-row" role="row" key={`${row.sentAt}-${row.recipient}-${row.taskName}`}>
              <span className="assigned-task-student-name" role="cell">{row.recipient}</span>
              <span className="assigned-task-completion-cell" role="cell">
                <Badge variant="secondary" className="assigned-task-status" data-status={row.status}>
                  {row.status}
                </Badge>
              </span>
              <span role="cell">{hasWritingData ? writingResult.wordCount.toLocaleString() : "-"}</span>
              <span role="cell">{row.status === "Completed" ? writingResult.score : "-"}</span>
              <span role="cell">{hasWritingData ? writingResult.versions : "-"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
