import { useState } from "react";
import { api } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import {
  applyReportGrowthDirection,
  convertLexileToAr,
  formatSignedDecimalGrowth,
  formatSignedGrowth,
  getReportGrowthDirection,
  getStudentDetailFromDirectory,
  getStudentReportData,
  summarizeTrend,
} from "@/lib/lexileReport";
import type { ReportTimeRange, StudentDetailStudent, StudentDetailTab, StudentDirectoryEntry } from "@/types";
import type { ReportOption } from "./StudentReportPanel";
import { reportDimensionOptions, reportTimeRangeOptions, type ReportDimension } from "./reportOptions";

type ReportSortKey = "lexile" | "ar" | "readingTime" | "readingWords" | "writingTime" | "writingWords";
type SortDirection = "asc" | "desc";

function ReportSortIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.18 17.15L7.14001 14.11" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.18 6.84998V17.15" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.82 6.84998L16.86 9.88998" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.82 17.15V6.84998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LeaderboardArrowIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.91 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.91 4.07996" stroke="#171717" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type ReportLeaderboardRow = {
  rank: number;
  student: StudentDetailStudent;
  lexileGrowth: number;
  arGrowth: number;
  readingTime: number;
  readingTimeGrowth: number;
  readingWords: number;
  readingWordsGrowth: number;
  writingTime: number;
  writingTimeGrowth: number;
  writingWords: number;
  writingWordsGrowth: number;
};

export function LexileLeaderboardCard({
  onOpenStudent,
  timeRange,
  onTimeRangeChange,
  students = [],
  timeRangeOptions = reportTimeRangeOptions,
  dimensionOptions = reportDimensionOptions,
}: {
  onOpenStudent: (student: StudentDetailStudent, tab?: StudentDetailTab) => void;
  timeRange: ReportTimeRange;
  onTimeRangeChange: (timeRange: ReportTimeRange) => void;
  students?: StudentDirectoryEntry[];
  timeRangeOptions?: Array<ReportOption<ReportTimeRange>>;
  dimensionOptions?: Array<ReportOption<ReportDimension>>;
}) {
  const [activeDimension, setActiveDimension] = useState<ReportDimension>("academic");
  const [sortKey, setSortKey] = useState<ReportSortKey>("lexile");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { data: completionLeaderboard = [] } = useApi(() => api.getCompletionLeaderboard());
  const { data: reportLeaderboard = [] } = useApi(() => api.getLexileLeaderboard());
  const sortValueByKey: Record<ReportSortKey, (row: ReportLeaderboardRow) => number> = {
    lexile: (row) => row.student.lexile,
    ar: (row) => row.student.ar,
    readingTime: (row) => row.readingTime,
    readingWords: (row) => row.readingWords,
    writingTime: (row) => row.writingTime,
    writingWords: (row) => row.writingWords,
  };
  const handleSort = (key: ReportSortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDirection("desc");
  };
  const sortButton = (key: ReportSortKey, label: string) => (
    <button type="button" className="report-sort-button" aria-label={`Sort by ${label}`} aria-pressed={sortKey === key} data-active={sortKey === key} data-direction={sortKey === key ? sortDirection : undefined} onClick={() => handleSort(key)}>
      <span>{label}</span>
      <ReportSortIcon />
    </button>
  );
  const rows: ReportLeaderboardRow[] = students
    .map((directoryStudent) => {
      const student = getStudentDetailFromDirectory(directoryStudent, completionLeaderboard, reportLeaderboard);
      const reportData = getStudentReportData(student, timeRange);
      const lexile = summarizeTrend(reportData.lexile);
      const readingTime = summarizeTrend(reportData.readingTime);
      const readingWords = summarizeTrend(reportData.readingWords);
      const writingTime = summarizeTrend(reportData.writingTime);
      const writingWords = summarizeTrend(reportData.writingWords);
      const arStart = convertLexileToAr(lexile.first);
      return {
        rank: 0,
        student,
        lexileGrowth: applyReportGrowthDirection(lexile.delta, student.id, 1),
        arGrowth: Number((Math.abs(student.ar - arStart) * getReportGrowthDirection(student.id, 2)).toFixed(1)),
        readingTime: readingTime.total,
        readingTimeGrowth: applyReportGrowthDirection(readingTime.delta, student.id, 3),
        readingWords: readingWords.total,
        readingWordsGrowth: applyReportGrowthDirection(readingWords.delta, student.id, 4),
        writingTime: writingTime.total,
        writingTimeGrowth: applyReportGrowthDirection(writingTime.delta, student.id, 5),
        writingWords: writingWords.total,
        writingWordsGrowth: applyReportGrowthDirection(writingWords.delta, student.id, 6),
      };
    })
    .sort((a, b) => {
      const sortDifference = sortValueByKey[sortKey](a) - sortValueByKey[sortKey](b);
      const directedDifference = sortDirection === "asc" ? sortDifference : -sortDifference;
      return directedDifference || b.readingWords - a.readingWords || a.student.name.localeCompare(b.student.name);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return (
    <Card className="lexile-leaderboard-card report-leaderboard-card">
      <CardHeader>
        <CardAction>
          <div className="student-report-range" role="tablist" aria-label="Report time range">
            {timeRangeOptions.map((option) => (
              <button key={option.key} type="button" role="tab" aria-selected={timeRange === option.key} onClick={() => onTimeRangeChange(option.key)}>
                {option.label}
              </button>
            ))}
          </div>
          <div className="report-dimension-tabs" role="tablist" aria-label="Report dimension">
            {dimensionOptions.map((option) => (
              <button key={option.key} type="button" role="tab" aria-selected={activeDimension === option.key} onClick={() => setActiveDimension(option.key)}>
                {option.label}
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="report-leaderboard-table" data-active-dimension={activeDimension}>
          <div className="lexile-leaderboard-head" data-active-dimension={activeDimension}>
            <span>#</span>
            <span>Student</span>
            <div className="report-metric-group" data-dimension="academic" data-active={activeDimension === "academic"}>
              {sortButton("lexile", "Lexile")}
              {activeDimension === "academic" && <span>Lexile Growth</span>}
              {sortButton("ar", "AR")}
              {activeDimension === "academic" && <span>AR Growth</span>}
            </div>
            <div className="report-metric-group" data-dimension="reading" data-active={activeDimension === "reading"}>
              {sortButton("readingTime", "Reading Time")}
              {activeDimension === "reading" && <span>Time Growth</span>}
              {sortButton("readingWords", "Reading Words")}
              {activeDimension === "reading" && <span>Words Growth</span>}
            </div>
            <div className="report-metric-group" data-dimension="writing" data-active={activeDimension === "writing"}>
              {sortButton("writingTime", "Writing Time")}
              {activeDimension === "writing" && <span>Time Growth</span>}
              {sortButton("writingWords", "Writing Words")}
              {activeDimension === "writing" && <span>Words Growth</span>}
            </div>
            <span />
          </div>
          {rows.map((row) => (
            <div className="lexile-leaderboard-row" data-active-dimension={activeDimension} key={row.student.id} role="button" tabIndex={0} onClick={() => onOpenStudent(row.student, "report")} onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenStudent(row.student, "report");
              }
            }}>
              <Badge variant="secondary" className="rank-badge" data-rank={row.rank}>{row.rank}</Badge>
              <div className="leaderboard-student">
                <span className="leaderboard-avatar" style={row.student.avatarImage ? undefined : { backgroundColor: row.student.color }}>
                  {row.student.avatarImage ? <img src={row.student.avatarImage} alt="" /> : row.student.avatar}
                </span>
                <strong>{row.student.name}</strong>
              </div>
              <div className="report-metric-group" data-dimension="academic" data-active={activeDimension === "academic"}>
                <span>{row.student.lexile}L</span>
                {activeDimension === "academic" && <span data-growth={row.lexileGrowth < 0 ? "down" : row.lexileGrowth > 0 ? "up" : "flat"}>{formatSignedGrowth(row.lexileGrowth, "L")}</span>}
                <span>{row.student.ar}</span>
                {activeDimension === "academic" && <span data-growth={row.arGrowth < 0 ? "down" : row.arGrowth > 0 ? "up" : "flat"}>{formatSignedDecimalGrowth(row.arGrowth)}</span>}
              </div>
              <div className="report-metric-group" data-dimension="reading" data-active={activeDimension === "reading"}>
                <span>{row.readingTime.toLocaleString()} min</span>
                {activeDimension === "reading" && <span data-growth={row.readingTimeGrowth < 0 ? "down" : row.readingTimeGrowth > 0 ? "up" : "flat"}>{formatSignedGrowth(row.readingTimeGrowth, "min")}</span>}
                <span>{row.readingWords.toLocaleString()}</span>
                {activeDimension === "reading" && <span data-growth={row.readingWordsGrowth < 0 ? "down" : row.readingWordsGrowth > 0 ? "up" : "flat"}>{formatSignedGrowth(row.readingWordsGrowth)}</span>}
              </div>
              <div className="report-metric-group" data-dimension="writing" data-active={activeDimension === "writing"}>
                <span>{row.writingTime.toLocaleString()} min</span>
                {activeDimension === "writing" && <span data-growth={row.writingTimeGrowth < 0 ? "down" : row.writingTimeGrowth > 0 ? "up" : "flat"}>{formatSignedGrowth(row.writingTimeGrowth, "min")}</span>}
                <span>{row.writingWords.toLocaleString()}</span>
                {activeDimension === "writing" && <span data-growth={row.writingWordsGrowth < 0 ? "down" : row.writingWordsGrowth > 0 ? "up" : "flat"}>{formatSignedGrowth(row.writingWordsGrowth)}</span>}
              </div>
              <Button type="button" variant="ghost" size="icon-sm" className="leaderboard-detail-button" aria-label={`View ${row.student.name} report details`} onClick={(event) => {
                event.stopPropagation();
                onOpenStudent(row.student, "report");
              }}>
                <LeaderboardArrowIcon />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
