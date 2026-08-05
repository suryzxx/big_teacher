import {
  getArTrendFromLexile,
  getReportClassAverageData,
  getStudentReportData,
} from "@/lib/lexileReport";
import type { ReportTimeRange, StudentDetailStudent, StudentDetailTab, StudentDirectoryEntry } from "@/types";
import { LexileLeaderboardCard } from "./LexileLeaderboard";
import { StudentReportPanel } from "./StudentReportPanel";
import { reportDimensionOptions, reportTimeRangeOptions } from "./reportOptions";
import { api } from "@/api";
import { useApi } from "@/hooks/useApi";

export function ReportStudentPanel({
  student,
  timeRange,
}: {
  student: StudentDetailStudent;
  timeRange: ReportTimeRange;
}) {
  const { data: completionLeaderboard = [] } = useApi(() => api.getCompletionLeaderboard());
  const { data: reportLeaderboard = [] } = useApi(() => api.getLexileLeaderboard());

  return (
    <StudentReportPanel
      student={student}
      timeRange={timeRange}
      timeRangeOptions={reportTimeRangeOptions}
      dimensionOptions={reportDimensionOptions}
      getStudentReportData={getStudentReportData}
      getReportClassAverageData={(range) => getReportClassAverageData(range, reportLeaderboard, completionLeaderboard)}
      getArTrendFromLexile={getArTrendFromLexile}
    />
  );
}

export function LexileArSection({
  onOpenStudent,
  timeRange,
  onTimeRangeChange,
  students = [],
}: {
  onOpenStudent: (student: StudentDetailStudent, tab?: StudentDetailTab) => void;
  timeRange: ReportTimeRange;
  onTimeRangeChange: (timeRange: ReportTimeRange) => void;
  students?: StudentDirectoryEntry[];
}) {
  return (
    <section className="lexile-dashboard">
      <div className="lexile-leaderboard-area">
        <LexileLeaderboardCard
          onOpenStudent={onOpenStudent}
          timeRange={timeRange}
          onTimeRangeChange={onTimeRangeChange}
          students={students}
        />
      </div>
    </section>
  );
}
