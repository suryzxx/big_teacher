import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { convertLexileToAr } from "@/lib/lexile";
import type { CompletionLeaderboardStudent, StudentDetailStudent, StudentDetailTab } from "@/types";

export function LeaderboardArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.91 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.91 4.07996"
        stroke="#171717"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function toStudentDetailStudent(student: CompletionLeaderboardStudent): StudentDetailStudent {
  return {
    ...student,
    lexile: student.readingLevel,
    ar: convertLexileToAr(student.readingLevel),
    trend: Math.max(45, Math.round(student.rate * 0.9)),
    accuracy: student.rate,
  };
}

export function StudentCompletionBar({
  student,
  onOpen,
}: {
  student: CompletionLeaderboardStudent;
  onOpen: () => void;
}) {
  const completedWidth = (student.completed / student.total) * 100;
  const inProgressWidth = (student.inProgress / student.total) * 100;
  const notStartedWidth = Math.max(0, 100 - completedWidth - inProgressWidth);

  return (
    <div className="leaderboard-status-cell">
      <div className="leaderboard-status-chart" aria-label={`${student.name}: ${student.done} of ${student.total} tasks complete`}>
        <span className="leaderboard-status-segment completed" style={{ width: `${completedWidth}%` }} />
        <span className="leaderboard-status-segment in-progress" style={{ width: `${inProgressWidth}%` }} />
        <span className="leaderboard-status-segment not-started" style={{ width: `${notStartedWidth}%` }} />
        <span className="leaderboard-chart-label">
          {student.done}/{student.total} · {student.rate}%
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="leaderboard-detail-button"
        aria-label={`View ${student.name} task completion`}
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        <LeaderboardArrowIcon />
      </Button>
    </div>
  );
}

export function LeaderboardCard({
  students,
  onOpenStudent,
  toStudentDetail = toStudentDetailStudent,
}: {
  students: CompletionLeaderboardStudent[];
  onOpenStudent: (student: StudentDetailStudent, tab?: StudentDetailTab) => void;
  toStudentDetail?: (student: CompletionLeaderboardStudent) => StudentDetailStudent;
}) {
  const completionRows = [...students].sort((left, right) => left.rate - right.rate || left.name.localeCompare(right.name));

  return (
    <Card className="leaderboard-card">
      <CardContent>
        <div className="leaderboard-head">
          <span>Students</span>
          <span>Task Status</span>
        </div>
        <div className="leaderboard-list">
          {completionRows.map((student) => (
            <div
              className="leaderboard-row"
              key={student.name}
              role="button"
              tabIndex={0}
              onClick={() => onOpenStudent(toStudentDetail(student), "tasks")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenStudent(toStudentDetail(student), "tasks");
                }
              }}
            >
              <div className="leaderboard-student">
                <span className="leaderboard-avatar" style={student.avatarImage ? undefined : { backgroundColor: student.color }}>
                  {student.avatarImage ? <img src={student.avatarImage} alt="" /> : student.avatar}
                </span>
                <strong>{student.name}</strong>
              </div>
              <StudentCompletionBar student={student} onOpen={() => onOpenStudent(toStudentDetail(student), "tasks")} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
