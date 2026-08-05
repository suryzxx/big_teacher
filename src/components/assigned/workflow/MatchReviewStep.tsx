import { RefreshCw } from "lucide-react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import { assignContentOptions, type AssignContentType } from "./TaskInfoStep";
import type { Resource, StudentDirectoryEntry } from "@/types";

type MatchRow = {
  student: StudentDirectoryEntry;
  resource: Resource;
  taskType: AssignContentType;
  matchedLexile: number;
};

export function MatchReviewStep({
  selectedStudents,
  taskCounts,
}: {
  selectedStudents: StudentDirectoryEntry[];
  taskCounts: Record<AssignContentType, number>;
}) {
  const { data: resources = [] } = useApi(() => api.getResources());
  const selectedTaskTypes = assignContentOptions.filter((item) => taskCounts[item.type] > 0).map((item) => item.type);
  const matchTaskTypes = selectedTaskTypes.length > 0 ? selectedTaskTypes : assignContentOptions.map((item) => item.type);
  const matchedRows: MatchRow[] = selectedStudents.map((student, index) => {
    const taskType = matchTaskTypes[index % matchTaskTypes.length];
    const matchingResources = resources.filter((item) => item.type === taskType);
    const resource = matchingResources[index % matchingResources.length] ?? resources[(index + 1) % resources.length];
    return {
      student,
      resource,
      taskType,
      matchedLexile: Math.max(400, Math.min(1200, student.lexile + ((index % 3) - 1) * 30)),
    };
  });

  function getAssignMatchLength(row: MatchRow) {
    if (row.taskType === "Reading" && "wordCount" in row.resource) return `${row.resource.wordCount.toLocaleString()} words`;
    if ((row.taskType === "Video" || row.taskType === "Podcast") && "duration" in row.resource) return row.resource.duration;
    return "-";
  }

  return (
    <div className="assign-step-panel assign-match-review">
      <div className="assign-match-table">
        <div className="assign-match-head">
          <strong>Student</strong>
          <strong>Student/Task</strong>
          <strong>Type</strong>
          <strong>Content</strong>
          <strong>Length</strong>
          <strong>Genre</strong>
          <strong>Rematch</strong>
        </div>
        <div className="assign-match-body">
          {matchedRows.map((row) => (
            <div className="assign-match-row" key={row.student.id}>
              <span>{row.student.name}</span>
              <span className="assign-match-lexile">{row.student.lexile}L/{row.matchedLexile}L</span>
              <span className="assign-match-type">{row.taskType}</span>
              <span className="assign-match-title" title={row.resource.title}>{row.resource.title}</span>
              <span className="assign-match-length">{getAssignMatchLength(row)}</span>
              <span className="assign-match-genre" title={row.resource.genre}>{row.resource.genre}</span>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Rematch ${row.student.name}`}>
                <RefreshCw size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
