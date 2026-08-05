import { resources } from "@/data";
import type { AssignedCompletionDetail, AssignedTaskRow, AssignStatsPeriod, Resource, ResourceType } from "../types";

export type AssignedTaskRowsByWeek = Record<string, AssignedTaskRow[]>;
export type AssignedStatusSummary = {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completedPercent: number;
  inProgressPercent: number;
  notStartedPercent: number;
};
export type AssignedTypeSummary = Record<ResourceType, number>;
export type AssignedTaskStatusFilter = "All" | AssignedTaskRow["status"];
export type AssignedTaskTypeFilter = "All" | ResourceType;
export type AssignedTaskTimeFilter = "All time" | "This week" | "This month";
export type AssignedTaskFilters = {
  status: AssignedTaskStatusFilter;
  type: AssignedTaskTypeFilter;
  time: AssignedTaskTimeFilter;
};

const typeOrder: ResourceType[] = ["Reading", "Video", "Podcast", "Writing"];

export const assignedTaskStatusFilterOptions: AssignedTaskStatusFilter[] = ["All", "Completed", "In Progress", "Not Started"];
export const assignedTaskTypeFilterOptions: AssignedTaskTypeFilter[] = ["All", ...typeOrder];
export const assignedTaskTimeFilterOptions: AssignedTaskTimeFilter[] = ["All time", "This week", "This month"];

export function getAssignedRowResourceType(taskType: string): ResourceType {
  return taskType === "Writing prompt" ? "Writing" : (taskType as ResourceType);
}

export function getAssignedRowResource(row: AssignedTaskRow): Resource {
  const resourceType = getAssignedRowResourceType(row.taskType);
  return (
    resources.find((resource) => resource.type === resourceType && row.taskName.toLowerCase().includes(resource.title.split(" ")[0].toLowerCase())) ??
    resources.find((resource) => resource.type === resourceType) ??
    resources[0]
  );
}

export function getAssignedRowLength(row: AssignedTaskRow) {
  const resource = getAssignedRowResource(row);
  if ("wordCount" in resource) return `${resource.wordCount.toLocaleString()} words`;
  return resource.duration;
}

export function getAssignedRowMeta(row: AssignedTaskRow) {
  const resource = getAssignedRowResource(row);
  const resourceType = getAssignedRowResourceType(row.taskType);
  if (resourceType === "Writing") return `${resource.topic} · ${resource.genre}`;
  return `${resource.lexile}L · ${getAssignedRowLength(row)}`;
}

export function getAssignedRowReadingResult(row: AssignedTaskRow) {
  const seed = row.recipient.length + row.taskName.length + row.sentAt.length;
  const totalQuestions = 8 + (seed % 5);
  const correctAnswers = Math.max(1, totalQuestions - (seed % 3));
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  return { totalQuestions, correctAnswers, accuracy };
}

export function getAssignedRowWritingResult(row: AssignedTaskRow) {
  const seed = row.recipient.length + row.taskName.length + row.sentAt.length;
  const score = 78 + (seed % 18);
  const wordCount = 260 + (seed % 9) * 48;
  const versions = 1 + (seed % 4);
  return { score, wordCount, versions };
}

export function getAssignedRowScore(row: AssignedTaskRow) {
  if (row.status === "Not Started") return null;
  const resourceType = getAssignedRowResourceType(row.taskType);
  if (resourceType === "Writing") return getAssignedRowWritingResult(row).score;
  if (resourceType === "Reading") return getAssignedRowReadingResult(row).accuracy;
  if (row.status === "Completed") return 100;
  return 68 + ((row.id + row.recipient.length) % 21);
}

export function getAssignedTaskOperation(row: AssignedTaskRow) {
  const resourceType = getAssignedRowResourceType(row.taskType);
  if (resourceType === "Writing") return "Discussion";
  if (resourceType === "Reading" && (row.status === "Completed" || row.status === "In Progress")) return "Feedback";
  return "";
}

export function getAssignedCompletionDetail(row: AssignedTaskRow): AssignedCompletionDetail | null {
  if (row.status !== "Completed") return null;
  const resourceType = getAssignedRowResourceType(row.taskType);
  if (resourceType === "Reading") {
    const { totalQuestions, correctAnswers, accuracy } = getAssignedRowReadingResult(row);
    return { kind: "Reading", label: `${accuracy}%`, totalQuestions, correctAnswers };
  }
  if (resourceType === "Writing") {
    const writingResult = getAssignedRowWritingResult(row);
    return {
      kind: "Writing",
      label: `${writingResult.score}`,
      score: writingResult.score,
      wordCount: writingResult.wordCount,
      versions: writingResult.versions,
    };
  }
  return null;
}

export function getAssignedStatusSummary(rows: AssignedTaskRow[]): AssignedStatusSummary {
  const total = rows.length;
  const completed = rows.filter((row) => row.status === "Completed").length;
  const inProgress = rows.filter((row) => row.status === "In Progress").length;
  const notStarted = rows.filter((row) => row.status === "Not Started").length;
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressPercent = total > 0 ? Math.round((inProgress / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    notStarted,
    completedPercent,
    inProgressPercent,
    notStartedPercent: Math.max(0, 100 - completedPercent - inProgressPercent),
  };
}

export function getAssignedCompletionState(rows: AssignedTaskRow[]) {
  const summary = getAssignedStatusSummary(rows);
  if (summary.completed === 0) return "empty";
  if (summary.inProgress === 0 && summary.notStarted === 0) return "complete";
  return "partial";
}

export function getAssignedTypeSummary(rows: AssignedTaskRow[]): AssignedTypeSummary {
  return rows.reduce<AssignedTypeSummary>(
    (summary, row) => {
      summary[getAssignedRowResourceType(row.taskType)] += 1;
      return summary;
    },
    { Reading: 0, Video: 0, Podcast: 0, Writing: 0 },
  );
}

export function getAssignedActiveTypes(rows: AssignedTaskRow[]) {
  const summary = getAssignedTypeSummary(rows);
  return typeOrder.filter((resourceType) => summary[resourceType] > 0);
}

export function getAssignedRowsForStudent(rows: AssignedTaskRow[], student: { id: string; name: string }) {
  return rows.filter((row) => row.studentId === student.id || row.recipient === student.name);
}

export function filterAssignedTaskRows(rows: AssignedTaskRow[], filters: AssignedTaskFilters) {
  const latestSentAt = rows.reduce((max, row) => Math.max(max, Date.parse(row.sentAtDate)), 0);
  const cutoffDays = filters.time === "This week" ? 7 : filters.time === "This month" ? 30 : 0;

  return rows.filter((row) => {
    const displayType = getAssignedRowResourceType(row.taskType);
    const matchesStatus = filters.status === "All" || row.status.toLowerCase() === filters.status.toLowerCase();
    const matchesType = filters.type === "All" || displayType === filters.type;
    const matchesTime = cutoffDays === 0 || (latestSentAt > 0 && Date.parse(row.sentAtDate) >= latestSentAt - cutoffDays * 86_400_000);
    return matchesStatus && matchesType && matchesTime;
  });
}

export function paginateAssignedTaskRows(rows: AssignedTaskRow[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStartIndex = (currentPage - 1) * pageSize;
  const pagedRows = rows.slice(pageStartIndex, pageStartIndex + pageSize);
  const pageEndIndex = Math.min(pageStartIndex + pagedRows.length, rows.length);

  return { totalPages, currentPage, pageStartIndex, pageEndIndex, pagedRows };
}

export function getAssignStatusSummary(rowsByWeek: AssignedTaskRowsByWeek, period: AssignStatsPeriod) {
  const thisWeekRows = rowsByWeek["this-week"] ?? [];
  const allRows = Object.values(rowsByWeek).flat();
  const rows = period === "week" ? thisWeekRows : allRows;

  return getAssignedStatusSummary(rows);
}
