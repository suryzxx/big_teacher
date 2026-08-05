import { useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClickOutside } from "@/lib/useClickOutside";
import {
  assignedTaskStatusFilterOptions,
  assignedTaskTimeFilterOptions,
  assignedTaskTypeFilterOptions,
  filterAssignedTaskRows,
  getAssignedRowMeta,
  getAssignedRowResourceType,
  getAssignedRowScore,
  getAssignedRowsForStudent,
  getAssignedTaskOperation,
  paginateAssignedTaskRows,
} from "@/lib/assignedTasks";
import type { AssignedTaskStatusFilter, AssignedTaskTimeFilter, AssignedTaskTypeFilter } from "@/lib/assignedTasks";
import type { AssignedTaskRow, ResourceType } from "@/types";
import type { StudentDetailStudent } from "@/types";

export type TypeIconRenderer = (type: ResourceType) => ReactNode;

export function TaskStatusPill({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={`status status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
      {status}
    </Badge>
  );
}

function TaskFilterChevronIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19.92 8.94995L13.4 15.47C12.63 16.24 11.37 16.24 10.6 15.47L4.08 8.94995"
        stroke="#171717"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type StudentTaskDropdownOption = AssignedTaskStatusFilter | AssignedTaskTypeFilter | AssignedTaskTimeFilter;

export function StudentTaskDropdown<Option extends StudentTaskDropdownOption>({
  value,
  options,
  onChange,
}: {
  value: Option;
  options: Option[];
  onChange: (value: Option) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLSpanElement | null>(null);

  useClickOutside(dropdownRef, open, () => setOpen(false));

  return (
    <span className="student-task-select" data-open={open} ref={dropdownRef}>
      <button type="button" onClick={() => setOpen((current) => !current)}>
        <span>{value}</span>
        <TaskFilterChevronIcon />
      </button>
      {open && (
        <span className="student-task-select-menu">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              data-selected={option === value}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

export function StudentTasksPanel({
  student,
  rows,
  renderTypeIcon,
  pageSize = 10,
}: {
  student: StudentDetailStudent;
  rows: AssignedTaskRow[];
  renderTypeIcon: TypeIconRenderer;
  pageSize?: number;
}) {
  const [statusFilter, setStatusFilter] = useState<AssignedTaskStatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<AssignedTaskTypeFilter>("All");
  const [timeFilter, setTimeFilter] = useState<AssignedTaskTimeFilter>("All time");
  const [page, setPage] = useState(1);
  const filterKey = `${statusFilter}|${typeFilter}|${timeFilter}|${student.id}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }
  const studentTaskRows = getAssignedRowsForStudent(rows, student);
  const visibleTasks = filterAssignedTaskRows(studentTaskRows, {
    status: statusFilter,
    type: typeFilter,
    time: timeFilter,
  });
  const { totalPages, currentPage, pageStartIndex, pageEndIndex, pagedRows: pagedTasks } = paginateAssignedTaskRows(visibleTasks, page, pageSize);

  return (
    <div className="student-task-dialog-content">
      <div className="student-task-filters">
        <label>
          <span>Status</span>
          <StudentTaskDropdown value={statusFilter} options={assignedTaskStatusFilterOptions} onChange={setStatusFilter} />
        </label>
        <label>
          <span>Type</span>
          <StudentTaskDropdown value={typeFilter} options={assignedTaskTypeFilterOptions} onChange={setTypeFilter} />
        </label>
        <label>
          <span>Time Range</span>
          <StudentTaskDropdown value={timeFilter} options={assignedTaskTimeFilterOptions} onChange={setTimeFilter} />
        </label>
      </div>

      <div className="student-task-table" role="table" aria-label={`${student.name} task list`}>
        <div className="student-task-table-head" role="row">
          <span role="columnheader">Task Info</span>
          <span role="columnheader">Completion</span>
          <span role="columnheader">Operation</span>
        </div>
        {pagedTasks.map((task) => {
          const displayType = getAssignedRowResourceType(task.taskType);
          const score = getAssignedRowScore(task);
          const operation = getAssignedTaskOperation(task);
          return (
            <div key={task.id} className="student-task-table-row" role="row">
              <div className="student-task-info-cell" role="cell" data-type={displayType}>
                <strong>{task.taskName}</strong>
                <span>
                  {renderTypeIcon(displayType)}
                  {getAssignedRowMeta(task)}
                </span>
              </div>
              <div className="student-task-completion-cell" role="cell">
                <TaskStatusPill status={task.status} />
                {score === null ? <span className="student-task-empty-value">-</span> : <strong>{score}%</strong>}
              </div>
              <div className="student-task-operation-cell" role="cell">
                {operation ? (
                  <Button type="button" variant="outline" className="student-task-feedback-button">
                    {operation}
                  </Button>
                ) : (
                  <span className="student-task-empty-value">-</span>
                )}
              </div>
            </div>
          );
        })}
        <div className="student-task-pagination">
          <span>
            {visibleTasks.length === 0 ? "0" : pageStartIndex + 1}-{pageEndIndex} / {visibleTasks.length}
          </span>
          <div>
            <Button type="button" variant="outline" className="student-task-page-button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </Button>
            <strong>
              {currentPage} / {totalPages}
            </strong>
            <Button
              type="button"
              variant="outline"
              className="student-task-page-button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
