import { lexileTrend } from "@/data";
import { getCompletionStudentFromDirectory, getInitials } from "@/lib/assignedOverview";
import { convertLexileToAr } from "./lexile";
import type {
  CompletionLeaderboardStudent,
  LexileLeaderboardStudent,
  ReportTimeRange,
  ReportTrendPoint,
  StudentDetailStudent,
  StudentDirectoryEntry,
  StudentReadingReportData,
} from "@/types";

export { convertLexileToAr, lexileTrend };

export function getReportStudentFromDirectory(
  student: StudentDirectoryEntry,
  reportLeaderboard: LexileLeaderboardStudent[],
): LexileLeaderboardStudent {
  const matchedStudent = reportLeaderboard.find((item) => item.name === student.name);
  const fallbackRank = reportLeaderboard.length + 1;

  return {
    rank: matchedStudent?.rank ?? fallbackRank,
    name: student.name,
    lexile: student.lexile,
    ar: student.ar,
    trend: matchedStudent?.trend ?? Math.max(52, Math.round((student.lexile - 560) * 0.2)),
    accuracy: matchedStudent?.accuracy ?? Math.min(96, Math.max(72, Math.round(student.ar * 13 + 24))),
    avatar: getInitials(student.name),
    avatarImage: student.avatarImage,
    color: student.avatarColor,
    id: student.id,
  };
}

export function createStudentDetailStudent(
  taskStudent: CompletionLeaderboardStudent,
  reportStudent?: LexileLeaderboardStudent,
  reportLeaderboard: LexileLeaderboardStudent[] = [],
): StudentDetailStudent {
  const matchedReport = reportStudent ?? reportLeaderboard.find((item) => item.name === taskStudent.name);
  const reportLexile = matchedReport?.lexile ?? taskStudent.readingLevel;
  const reportAr = matchedReport?.ar ?? convertLexileToAr(reportLexile);

  return {
    ...taskStudent,
    id: matchedReport?.id ?? taskStudent.id,
    lexile: reportLexile,
    ar: reportAr,
    trend: matchedReport?.trend ?? Math.max(45, Math.round(taskStudent.rate * 0.9)),
    accuracy: matchedReport?.accuracy ?? taskStudent.rate,
    avatar: taskStudent.avatar || matchedReport?.avatar || getInitials(taskStudent.name),
    avatarImage: taskStudent.avatarImage ?? matchedReport?.avatarImage,
    color: taskStudent.color || matchedReport?.color || "#ffffff",
    readingLevel: taskStudent.readingLevel || reportLexile,
  };
}

export function getStudentDetailFromDirectory(
  student: StudentDirectoryEntry,
  completionLeaderboard: CompletionLeaderboardStudent[],
  reportLeaderboard: LexileLeaderboardStudent[],
) {
  return createStudentDetailStudent(
    getCompletionStudentFromDirectory(student, completionLeaderboard),
    getReportStudentFromDirectory(student, reportLeaderboard),
    reportLeaderboard,
  );
}

export function getStudentDetailFromReportStudent(
  student: LexileLeaderboardStudent,
  completionLeaderboard: CompletionLeaderboardStudent[],
) {
  const matchedTaskStudent = completionLeaderboard.find((item) => item.name === student.name) ?? completionLeaderboard[0];
  return createStudentDetailStudent(matchedTaskStudent, student, []);
}

export function getStudentReportData(student: StudentDetailStudent, timeRange: ReportTimeRange): StudentReadingReportData {
  const monthLexileData = lexileTrend.map((item, index) => ({
    label: item.label,
    value: index === lexileTrend.length - 1 ? student.lexile : Math.round(item.lexile + (student.lexile - 1000) * 0.18),
  }));
  const weekLexileData = [
    { label: "Mon", value: Math.max(400, student.lexile - 42) },
    { label: "Tue", value: Math.max(400, student.lexile - 36) },
    { label: "Wed", value: Math.max(400, student.lexile - 22) },
    { label: "Thu", value: Math.max(400, student.lexile - 18) },
    { label: "Fri", value: Math.max(400, student.lexile - 8) },
    { label: "Sun", value: student.lexile },
  ];
  const semesterLexileData = [
    { label: "Jan", value: Math.max(400, student.lexile - student.trend) },
    { label: "Feb", value: Math.max(400, student.lexile - Math.round(student.trend * 0.78)) },
    { label: "Mar", value: Math.max(400, student.lexile - Math.round(student.trend * 0.58)) },
    { label: "Apr", value: Math.max(400, student.lexile - Math.round(student.trend * 0.36)) },
    { label: "May", value: Math.max(400, student.lexile - Math.round(student.trend * 0.18)) },
    { label: "Jun", value: student.lexile },
  ];
  const studentFactor = Math.max(0.76, Math.min(1.34, student.lexile / 940));
  const scaleSeries = (series: ReportTrendPoint[], multiplier = 1) =>
    series.map((item) => ({ ...item, value: Math.round(item.value * studentFactor * multiplier) }));

  const reportData: Record<ReportTimeRange, StudentReadingReportData> = {
    week: {
      lexile: weekLexileData,
      readingTime: scaleSeries([{ label: "Mon", value: 18 }, { label: "Tue", value: 22 }, { label: "Wed", value: 20 }, { label: "Thu", value: 26 }, { label: "Fri", value: 24 }, { label: "Sun", value: 32 }]),
      readingWords: scaleSeries([{ label: "Mon", value: 1380 }, { label: "Tue", value: 1640 }, { label: "Wed", value: 1510 }, { label: "Thu", value: 1880 }, { label: "Fri", value: 1760 }, { label: "Sun", value: 2140 }]),
      writingWords: scaleSeries([{ label: "Mon", value: 180 }, { label: "Tue", value: 220 }, { label: "Wed", value: 205 }, { label: "Thu", value: 260 }, { label: "Fri", value: 240 }, { label: "Sun", value: 300 }]),
      writingTime: scaleSeries([{ label: "Mon", value: 9 }, { label: "Tue", value: 12 }, { label: "Wed", value: 10 }, { label: "Thu", value: 15 }, { label: "Fri", value: 14 }, { label: "Sun", value: 17 }]),
    },
    month: {
      lexile: monthLexileData,
      readingTime: scaleSeries([{ label: "W1", value: 82 }, { label: "W2", value: 96 }, { label: "W3", value: 104 }, { label: "W4", value: 118 }]),
      readingWords: scaleSeries([{ label: "W1", value: 8200 }, { label: "W2", value: 9600 }, { label: "W3", value: 10800 }, { label: "W4", value: 12300 }]),
      writingWords: scaleSeries([{ label: "W1", value: 960 }, { label: "W2", value: 1180 }, { label: "W3", value: 1340 }, { label: "W4", value: 1510 }]),
      writingTime: scaleSeries([{ label: "W1", value: 42 }, { label: "W2", value: 48 }, { label: "W3", value: 54 }, { label: "W4", value: 61 }]),
    },
    semester: {
      lexile: semesterLexileData,
      readingTime: scaleSeries([{ label: "Jan", value: 82 }, { label: "Feb", value: 96 }, { label: "Mar", value: 104 }, { label: "Apr", value: 118 }, { label: "May", value: 126 }, { label: "Jun", value: 142 }]),
      readingWords: scaleSeries([{ label: "Jan", value: 8200 }, { label: "Feb", value: 9600 }, { label: "Mar", value: 10800 }, { label: "Apr", value: 12300 }, { label: "May", value: 13700 }, { label: "Jun", value: 15100 }]),
      writingWords: scaleSeries([{ label: "Jan", value: 960 }, { label: "Feb", value: 1180 }, { label: "Mar", value: 1340 }, { label: "Apr", value: 1510 }, { label: "May", value: 1680 }, { label: "Jun", value: 1890 }]),
      writingTime: scaleSeries([{ label: "Jan", value: 42 }, { label: "Feb", value: 48 }, { label: "Mar", value: 54 }, { label: "Apr", value: 61 }, { label: "May", value: 68 }, { label: "Jun", value: 74 }]),
    },
  };

  return reportData[timeRange];
}

export function getReportClassAverageData(
  timeRange: ReportTimeRange,
  reportLeaderboard: LexileLeaderboardStudent[],
  completionLeaderboard: CompletionLeaderboardStudent[],
): StudentReadingReportData {
  const classSeries = reportLeaderboard.map((student) =>
    getStudentReportData(getStudentDetailFromReportStudent(student, completionLeaderboard), timeRange),
  );
  const averageSeries = (metric: keyof StudentReadingReportData) => {
    const first = classSeries[0];
    if (!first) return [];
    return first[metric].map((point, index) => ({
      label: point.label,
      value: Math.round(classSeries.reduce((sum, series) => sum + series[metric][index].value, 0) / classSeries.length),
    }));
  };

  return {
    lexile: averageSeries("lexile"),
    readingTime: averageSeries("readingTime"),
    readingWords: averageSeries("readingWords"),
    writingTime: averageSeries("writingTime"),
    writingWords: averageSeries("writingWords"),
  };
}

export function getArTrendFromLexile(data: ReportTrendPoint[], finalAr?: number): ReportTrendPoint[] {
  return data.map((point, index) => ({
    label: point.label,
    value: index === data.length - 1 && finalAr !== undefined ? Number(finalAr.toFixed(1)) : convertLexileToAr(point.value),
  }));
}

export function summarizeTrend(data: ReportTrendPoint[]) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const delta = last - first;
  const percent = first === 0 ? 0 : Math.round((delta / first) * 100);
  return { total, first, last, delta, percent };
}

export function getChangeCopy(delta: number, unit: string, percent: number) {
  const absDelta = Math.abs(delta).toLocaleString();
  if (delta > 0) return `+${absDelta}${unit} (${percent > 0 ? "+" : ""}${percent}%)`;
  if (delta < 0) return `-${absDelta}${unit} (${percent}%)`;
  return `No change`;
}

export function getReportGrowthDirection(studentId: string, metricOffset: number) {
  const numericId = Number(studentId.replace(/\D/g, "")) || 0;
  return (numericId + metricOffset) % 5 < 2 ? -1 : 1;
}

export function applyReportGrowthDirection(value: number, studentId: string, metricOffset: number) {
  return Math.round(Math.abs(value) * getReportGrowthDirection(studentId, metricOffset));
}

export function formatSignedGrowth(value: number, unit = "") {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const spacing = unit ? " " : "";
  return `${sign}${Math.abs(value).toLocaleString()}${unit ? `${spacing}${unit}` : ""}`;
}

export function formatSignedDecimalGrowth(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(1)}`;
}
