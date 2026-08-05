import { useState, type MouseEvent } from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/api";
import { useApi } from "@/hooks/useApi";
import {
  getAssignedCompletionState,
  getAssignedRowResourceType,
  getAssignedStatusSummary,
} from "@/lib/assignedTasks";
import type { AssignedCompletionDetail, AssignedTaskRow, StudentDirectoryEntry } from "@/types";
import { AssignedTaskFeedbackDialog } from "./AssignedTaskFeedbackDialog";
import { AssignedTaskRowsTable } from "./AssignedTaskRowsTable";
import { AssignedTaskStatusSummary, AssignedTaskTypeSummary } from "./AssignedTaskSummaries";
import { AssignedWritingTaskTable } from "./AssignedWritingTaskTable";
import { getInitials } from "@/lib/assignedOverview";
import { CompletionDoneIcon, CompletionWarningIcon } from "@/components/shared/CompletionStatusIcons";
import { TypeFilterIcon } from "@/components/shared/TypeFilterIcon";

export function AssignedTaskListCard() {
  const { data: batches = [] } = useApi(() => api.getAssignedTaskBatches());
  const { data: students = [] } = useApi(() => api.getStudentDirectory());
  const [expandedBatchKey, setExpandedBatchKey] = useState<string | null>(null);
  const [defaultBatchApplied, setDefaultBatchApplied] = useState(false);
  if (!defaultBatchApplied && batches.length > 0) {
    setDefaultBatchApplied(true);
    setExpandedBatchKey(batches[0].key);
  }
  const [expandedStudentKeys, setExpandedStudentKeys] = useState<Record<string, boolean>>({});
  const [activeFeedbackRow, setActiveFeedbackRow] = useState<AssignedTaskRow | null>(null);
  const [completionTooltip, setCompletionTooltip] = useState<{ detail: AssignedCompletionDetail; x: number; y: number } | null>(null);

  function showCompletionTooltip(event: MouseEvent<HTMLElement>, detail: AssignedCompletionDetail) {
    setCompletionTooltip({ detail, x: event.clientX, y: event.clientY });
  }

  function getAssignedStudent(row: AssignedTaskRow) {
    return students.find((student) => student.id === row.studentId || student.name === row.recipient);
  }

  function getStudentTaskGroups(rows: AssignedTaskRow[]) {
    const groupMap = new Map<string, { key: string; name: string; student?: StudentDirectoryEntry; rows: AssignedTaskRow[] }>();
    rows.forEach((row) => {
      const student = getAssignedStudent(row);
      const key = student?.id ?? row.recipient;
      const group = groupMap.get(key) ?? { key, name: row.recipient, student, rows: [] };
      group.rows.push(row);
      groupMap.set(key, group);
    });
    return Array.from(groupMap.values());
  }

  function renderStudentTaskRows(rows: AssignedTaskRow[]) {
    return (
      <AssignedTaskRowsTable
        rows={rows}
        showStudent={false}
        renderTypeIcon={(type) => <TypeFilterIcon type={type} />}
        onCompletionHover={showCompletionTooltip}
        onCompletionLeave={() => setCompletionTooltip(null)}
        onFeedback={setActiveFeedbackRow}
      />
    );
  }

  function renderTaskTable(rows: AssignedTaskRow[]) {
    const isWritingBatch = rows.length > 0 && rows.every((row) => getAssignedRowResourceType(row.taskType) === "Writing");
    if (isWritingBatch) {
      return <AssignedWritingTaskTable rows={rows} renderTypeIcon={() => <TypeFilterIcon type="Writing" />} />;
    }

    if (rows.length > 1) {
      const studentGroups = getStudentTaskGroups(rows);
      return (
        <div className="assigned-task-student-list">
          {studentGroups.map((group) => {
            const studentExpanded = expandedStudentKeys[group.key] ?? false;
            const completedCount = getAssignedStatusSummary(group.rows).completed;
            const studentStatusIcon =
              completedCount === group.rows.length ? (
                <span className="assigned-task-student-state-icon" data-state="completed" title="All tasks completed">
                  <CompletionDoneIcon />
                </span>
              ) : completedCount === 0 ? (
                <span className="assigned-task-student-state-icon" data-state="not-started" title="No tasks completed">
                  <CompletionWarningIcon />
                </span>
              ) : null;

            return (
              <section className="assigned-task-student-card" data-expanded={studentExpanded} key={group.key}>
                <button
                  type="button"
                  className="assigned-task-student-toggle"
                  aria-expanded={studentExpanded}
                  onClick={() => setExpandedStudentKeys((current) => ({ ...current, [group.key]: !(current[group.key] ?? false) }))}
                >
                  <span className="assigned-task-student-avatar" style={group.student?.avatarImage ? undefined : { backgroundColor: group.student?.avatarColor }}>
                    {group.student?.avatarImage ? <img src={group.student.avatarImage} alt="" /> : getInitials(group.name)}
                  </span>
                  <span className="assigned-task-student-copy">
                    <strong>{group.name}</strong>
                    <span className="assigned-task-student-progress">
                      <em>{completedCount}/{group.rows.length}</em>
                      {studentStatusIcon}
                    </span>
                  </span>
                  <ChevronRight size={18} />
                </button>
                {studentExpanded && renderStudentTaskRows(group.rows)}
              </section>
            );
          })}
        </div>
      );
    }

    return (
      <AssignedTaskRowsTable
        rows={rows}
        showStudent
        renderTypeIcon={(type) => <TypeFilterIcon type={type} />}
        onCompletionHover={showCompletionTooltip}
        onCompletionLeave={() => setCompletionTooltip(null)}
        onFeedback={setActiveFeedbackRow}
      />
    );
  }

  return (
    <Card className="assigned-task-list-card">
      <CardContent>
        <div className="assigned-task-week-list">
          {batches.map((taskBatch) => {
            const isExpanded = expandedBatchKey === taskBatch.key;
            const completionState = getAssignedCompletionState(taskBatch.rows);

            return (
              <section className="assigned-task-week-card" data-expanded={isExpanded} data-completion-state={completionState} key={taskBatch.key}>
                <button
                  type="button"
                  className="assigned-task-week-toggle"
                  aria-expanded={isExpanded}
                  onClick={() => {
                    setExpandedBatchKey((current) => (current === taskBatch.key ? null : taskBatch.key));
                  }}
                >
                  <span>
                    <strong>{taskBatch.title}</strong>
                    <AssignedTaskStatusSummary rows={taskBatch.rows} />
                  </span>
                  <AssignedTaskTypeSummary rows={taskBatch.rows} renderTypeIcon={(type) => <TypeFilterIcon type={type} />} />
                  <time>{taskBatch.sentAt}</time>
                  <ChevronRight size={18} />
                </button>
                {isExpanded && renderTaskTable(taskBatch.rows)}
              </section>
            );
          })}
        </div>
        {activeFeedbackRow && (
          <AssignedTaskFeedbackDialog
            row={activeFeedbackRow}
            onClose={() => setActiveFeedbackRow(null)}
          />
        )}
        {completionTooltip && (
          <div
            className="assigned-task-score-tooltip"
            style={{ left: completionTooltip.x + 14, top: completionTooltip.y + 14 }}
            aria-hidden="true"
          >
            {completionTooltip.detail.kind === "Reading" ? (
              <>
                <strong>Quiz result</strong>
                <span>Total questions: {completionTooltip.detail.totalQuestions}</span>
                <span>Correct answers: {completionTooltip.detail.correctAnswers}</span>
              </>
            ) : (
              <>
                <strong>Writing result</strong>
                <span>Writing score: {completionTooltip.detail.score}</span>
                <span>Word count: {completionTooltip.detail.wordCount}</span>
                <span>Draft versions: {completionTooltip.detail.versions}</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
