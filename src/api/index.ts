import { apiRequest } from "./http";
import { mockApi } from "./mock";
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

export type ApiClient = {
  getResources(): Promise<Resource[]>;
  getClasses(): Promise<ClassRoom[]>;
  getStudentDirectory(): Promise<StudentDirectoryEntry[]>;
  getAssignedTaskRows(): Promise<AssignedTaskRow[]>;
  getAssignedTaskRowsByWeek(): Promise<Record<string, AssignedTaskRow[]>>;
  getAssignedTaskBatches(): Promise<AssignedTaskBatch[]>;
  getCompletionLeaderboard(): Promise<CompletionLeaderboardStudent[]>;
  getLexileLeaderboard(): Promise<LexileLeaderboardStudent[]>;
  getFeedbackContent(): Promise<FeedbackContent>;
};

// TODO: 接入真实后端时，将各方法替换为真实接口路径，并把 VITE_USE_MOCK 设为 "false"。
const realApi: ApiClient = {
  getResources: () => apiRequest<Resource[]>("/resources"),
  getClasses: () => apiRequest<ClassRoom[]>("/classes"),
  getStudentDirectory: () => apiRequest<StudentDirectoryEntry[]>("/students"),
  getAssignedTaskRows: () => apiRequest<AssignedTaskRow[]>("/assigned-tasks"),
  getAssignedTaskRowsByWeek: () => apiRequest<Record<string, AssignedTaskRow[]>>("/assigned-tasks/by-week"),
  getAssignedTaskBatches: () => apiRequest<AssignedTaskBatch[]>("/assigned-tasks/batches"),
  getCompletionLeaderboard: () => apiRequest<CompletionLeaderboardStudent[]>("/assigned-tasks/leaderboard"),
  getLexileLeaderboard: () => apiRequest<LexileLeaderboardStudent[]>("/reports/lexile-leaderboard"),
  getFeedbackContent: () => apiRequest<FeedbackContent>("/feedback"),
};

const useMock = import.meta.env.VITE_USE_MOCK !== "false";

export const api: ApiClient = useMock ? mockApi : realApi;
