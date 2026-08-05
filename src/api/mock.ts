import {
  assignedTaskRowsByWeek,
  classes,
  createLexileLeaderboard,
  feedbackMessages,
  feedbackQuestions,
  resources,
  studentDirectory,
  task011Seeds,
  task012Seed,
} from "@/data";
import { createCompletionLeaderboard, getInitials } from "@/lib/assignedOverview";
import type {
  AssignedTaskBatch,
  AssignedTaskRow,
  ClassRoom,
  CompletionLeaderboardStudent,
  FeedbackContent,
  LexileLeaderboardStudent,
  Resource,
  StudentDirectoryEntry,
} from "@/types";

const MOCK_DELAY_MS = 250;

function mock<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

function makeAssignedTaskRow(
  seed: AssignedTaskRow,
  recipient: string,
  index: number,
  status: AssignedTaskRow["status"],
  studentId?: string,
): AssignedTaskRow {
  return {
    ...seed,
    id: seed.id * 100 + index,
    studentId,
    recipient,
    submittedAt: status === "Completed" || status === "In Progress" ? seed.submittedAt : "-",
    completedAt: status === "Completed" ? seed.completedAt : "-",
    status,
  };
}

function getTask011Status(studentName: string, studentIndex: number, seed: AssignedTaskRow, taskIndex: number): AssignedTaskRow["status"] {
  if (studentName === "Aaliyah Johnson" || studentName === "Ethan Kim") return "Completed";
  if (studentName === "Sophia Patel" || studentName === "Noah Thompson") return "Not Started";

  const resourceType = seed.taskType === "Writing prompt" ? "Writing" : seed.taskType;
  if (resourceType === "Reading") {
    if ((studentIndex + taskIndex) % 5 === 0) return "In Progress";
    if ((studentIndex + taskIndex) % 4 === 0) return "Not Started";
    return "Completed";
  }
  return (studentIndex + taskIndex) % 4 === 0 ? "Not Started" : "Completed";
}

function buildAssignedTaskBatches(): AssignedTaskBatch[] {
  const latestSeed = assignedTaskRowsByWeek["this-week"][4];
  const classStatuses: AssignedTaskRow["status"][] = [
    "In Progress",
    "Completed",
    "In Progress",
    "Not Started",
    "Completed",
    "In Progress",
    "Not Started",
    "Completed",
  ];
  const task012Statuses: AssignedTaskRow["status"][] = studentDirectory.map((_, index) => (index % 9 === 0 ? "Not Started" : "Completed"));
  const task011Rows = studentDirectory.slice(0, 6).flatMap((student, studentIndex) =>
    task011Seeds.map((seed, taskIndex) => {
      const rowIndex = studentIndex * task011Seeds.length + taskIndex;
      return makeAssignedTaskRow(seed, student.name, rowIndex, getTask011Status(student.name, studentIndex, seed, taskIndex), student.id);
    }),
  );
  const task012Rows = studentDirectory.map((student, index) => makeAssignedTaskRow(task012Seed, student.name, index, task012Statuses[index], student.id));
  const sourceBatches = [
    {
      sentAt: task012Seed.sentAt,
      sentAtDate: task012Seed.sentAtDate,
      rows: task012Rows,
    },
    {
      sentAt: task011Seeds[0].sentAt,
      sentAtDate: task011Seeds[0].sentAtDate,
      rows: task011Rows,
    },
    {
      sentAt: latestSeed.sentAt,
      sentAtDate: latestSeed.sentAtDate,
      rows: studentDirectory.slice(0, 8).map((student, index) => makeAssignedTaskRow(latestSeed, student.name, index, classStatuses[index], student.id)),
    },
    ...Object.values(assignedTaskRowsByWeek)
      .flat()
      .filter((row) => row !== latestSeed)
      .map((row) => ({ sentAt: row.sentAt, sentAtDate: row.sentAtDate, rows: [row] })),
  ];

  return sourceBatches
    .sort((left, right) => Date.parse(right.sentAtDate) - Date.parse(left.sentAtDate))
    .map((batch, index) => ({
      key: `task-${String(sourceBatches.length - index).padStart(3, "0")}`,
      title: `task${String(sourceBatches.length - index).padStart(3, "0")}`,
      ...batch,
    }));
}

export const mockApi = {
  getResources: (): Promise<Resource[]> => mock(resources),
  getClasses: (): Promise<ClassRoom[]> => mock(classes),
  getStudentDirectory: (): Promise<StudentDirectoryEntry[]> => mock(studentDirectory),
  getAssignedTaskRows: (): Promise<AssignedTaskRow[]> => mock(Object.values(assignedTaskRowsByWeek).flat()),
  getAssignedTaskRowsByWeek: (): Promise<Record<string, AssignedTaskRow[]>> => mock(assignedTaskRowsByWeek),
  getAssignedTaskBatches: (): Promise<AssignedTaskBatch[]> => mock(buildAssignedTaskBatches()),
  getCompletionLeaderboard: (): Promise<CompletionLeaderboardStudent[]> => mock(createCompletionLeaderboard(classes[0].students)),
  getLexileLeaderboard: (): Promise<LexileLeaderboardStudent[]> => mock(createLexileLeaderboard(studentDirectory, getInitials)),
  getFeedbackContent: (): Promise<FeedbackContent> => mock({ questions: [...feedbackQuestions], messages: feedbackMessages }),
};
