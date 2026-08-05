import { CONSTANTS_BASE_URL, apiRequest } from "./http";
import { mockApi } from "./mock";
import type {
  AudioResource,
  AssignedTaskBatch,
  AssignedTaskRow,
  AssignClass,
  AssignPayloadItem,
  AssignStudent,
  AudioDetail,
  ClassRoom,
  CompletionLeaderboardStudent,
  ConstantsData,
  FeedbackContent,
  LexileLeaderboardStudent,
  ReadingResource,
  ReadingDetailResult,
  ReadingQuizItem,
  ReadingVocabularyItem,
  Resource,
  ResourceListQuery,
  ResourceListResult,
  StudentDirectoryEntry,
  VideoResource,
  VideoDetail,
  WritingTask,
  WritingTaskCreateParams,
  WritingTaskUpdateParams,
  WritingTaskListParams,
} from "@/types";

export type ApiClient = {
  getResources(): Promise<Resource[]>;
  getConstants(): Promise<ConstantsData>;
  getReadingDetail(hashId: string): Promise<ReadingDetailResult>;
  getReadingVocabulary(hashId: string): Promise<ReadingVocabularyItem[]>;
  getReadingQuiz(hashId: string): Promise<ReadingQuizItem[]>;
  getAudioDetail(hashId: string): Promise<AudioDetail>;
  getVideoDetail(hashId: string): Promise<VideoDetail>;
  getAssignClassList(): Promise<AssignClass[]>;
  getClassStudents(classId: number): Promise<AssignStudent[]>;
  assignResources(payload: AssignPayloadItem[]): Promise<void>;
  uploadImage(file: File): Promise<string>;
  getReadingList(params: ResourceListQuery): Promise<ResourceListResult<ReadingResource>>;
  getAudioList(params: ResourceListQuery): Promise<ResourceListResult<AudioResource>>;
  getVideoList(params: ResourceListQuery): Promise<ResourceListResult<VideoResource>>;
  getWritingTaskList(params: WritingTaskListParams): Promise<ResourceListResult<WritingTask>>;
  getWritingTaskDetail(taskId: string): Promise<WritingTask>;
  createWritingTask(params: WritingTaskCreateParams): Promise<void>;
  updateWritingTask(params: WritingTaskUpdateParams): Promise<void>;
  getClasses(): Promise<ClassRoom[]>;
  getStudentDirectory(): Promise<StudentDirectoryEntry[]>;
  getAssignedTaskRows(): Promise<AssignedTaskRow[]>;
  getAssignedTaskRowsByWeek(): Promise<Record<string, AssignedTaskRow[]>>;
  getAssignedTaskBatches(): Promise<AssignedTaskBatch[]>;
  getCompletionLeaderboard(): Promise<CompletionLeaderboardStudent[]>;
  getLexileLeaderboard(): Promise<LexileLeaderboardStudent[]>;
  getFeedbackContent(): Promise<FeedbackContent>;
};

// 后端班级列表返回项：目前只确认 id/name 存在，其余字段待有真实数据后对齐。
type ApiClassItem = {
  id: number | string;
  name: string;
  grade?: string | number;
  schedule?: string;
  active_unit?: string;
  activeUnit?: string;
};

function toClassRoom(item: ApiClassItem): ClassRoom {
  return {
    id: String(item.id),
    name: item.name,
    grade: item.grade != null ? String(item.grade) : "",
    schedule: item.schedule ?? "",
    activeUnit: item.active_unit ?? item.activeUnit ?? "",
    students: [],
  };
}

// 各方法接入真实后端后，把路径替换为真实接口路径；全部接入后，
// 将各环境 VITE_USE_MOCK 设为 "false" 即可整体切换。
const realApi: ApiClient = {
  getResources: () => apiRequest<Resource[]>("/resources"),
  getConstants: () => apiRequest<ConstantsData>(`${CONSTANTS_BASE_URL}/constants`),
  getReadingDetail: (hashId) =>
    apiRequest<ReadingDetailResult>(`/api/reading/detail?hash_id=${encodeURIComponent(hashId)}`),
  getReadingVocabulary: async (hashId) => {
    const result = await apiRequest<ReadingVocabularyItem[]>(
      `/api/assignment/vocabulary/list?hash_id=${encodeURIComponent(hashId)}`,
    );
    return result ?? [];
  },
  getReadingQuiz: async (hashId) => {
    const result = await apiRequest<ReadingQuizItem[]>(
      `/api/assignment/quiz/list?hash_id=${encodeURIComponent(hashId)}`,
    );
    return result ?? [];
  },
  getAudioDetail: (hashId) =>
    apiRequest<AudioDetail>(`/api/resource/audio/detail?id=${encodeURIComponent(hashId)}`),
  getVideoDetail: (hashId) =>
    apiRequest<VideoDetail>(`/api/resource/video/detail?id=${encodeURIComponent(hashId)}`),
  getAssignClassList: async () => {
    // Assign 弹窗的班级列表复用顶部班级切换器的接口（GET /api/b/class/list）
    const result = await apiRequest<ApiClassItem[]>("/api/b/class/list");
    return result.map((item) => ({ id: Number(item.id), name: item.name }));
  },
  getClassStudents: async (classId) => {
    // GET，班级 id 走 query 参数；data 可能是数组或 { list }，统一归一为数组
    const result = await apiRequest<AssignStudent[] | { total: number; list: AssignStudent[] | null } | null>(
      `/api/b/class/student/list?class_id=${classId}`,
    );
    if (Array.isArray(result)) return result;
    return result?.list ?? [];
  },
  assignResources: (payload) =>
    apiRequest<unknown>("/api/b/assign/simple", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(() => undefined),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiRequest<{ domain?: string; path?: string; url?: string } | string>(IMAGE_UPLOAD_PATH, {
      method: "POST",
      body: formData,
    });
    if (typeof result === "string") return result;
    // 存相对路径（path），展示时由 resolveMediaUrl 拼 OSS 域名
    return result.path ?? result.url ?? "";
  },
  getReadingList: async (params) => {
    const result = await apiRequest<ResourceListResult<ReadingResource>>("/api/reading/list", {
      method: "POST",
      body: JSON.stringify(params),
    });
    // 后端无结果时 list 可能为 null，归一为空数组避免前端崩溃
    return { ...result, list: result.list ?? [] };
  },
  getAudioList: async (params) => {
    const result = await apiRequest<ResourceListResult<AudioResource>>("/api/resource/audio/list", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return { ...result, list: result.list ?? [] };
  },
  getVideoList: async (params) => {
    const result = await apiRequest<ResourceListResult<VideoResource>>("/api/resource/video/list", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return { ...result, list: result.list ?? [] };
  },
  getWritingTaskList: async (params) => {
    const result = await apiRequest<ResourceListResult<WritingTask>>("/api/writing/task/list", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return { ...result, list: result.list ?? [] };
  },
  getWritingTaskDetail: (taskId) =>
    apiRequest<WritingTask>(`/api/writing/task/detail?task_id=${encodeURIComponent(taskId)}`),
  createWritingTask: (params) =>
    apiRequest<unknown>("/api/writing/task/create", {
      method: "POST",
      body: JSON.stringify(params),
    }).then(() => undefined),
  updateWritingTask: (params) =>
    apiRequest<unknown>("/api/writing/task/update", {
      method: "POST",
      body: JSON.stringify(params),
    }).then(() => undefined),
  getClasses: async () => (await apiRequest<ApiClassItem[]>("/api/b/class/list")).map(toClassRoom),
  getStudentDirectory: () => apiRequest<StudentDirectoryEntry[]>("/students"),
  getAssignedTaskRows: () => apiRequest<AssignedTaskRow[]>("/assigned-tasks"),
  getAssignedTaskRowsByWeek: () => apiRequest<Record<string, AssignedTaskRow[]>>("/assigned-tasks/by-week"),
  getAssignedTaskBatches: () => apiRequest<AssignedTaskBatch[]>("/assigned-tasks/batches"),
  getCompletionLeaderboard: () => apiRequest<CompletionLeaderboardStudent[]>("/assigned-tasks/leaderboard"),
  getLexileLeaderboard: () => apiRequest<LexileLeaderboardStudent[]>("/reports/lexile-leaderboard"),
  getFeedbackContent: () => apiRequest<FeedbackContent>("/feedback"),
};

const useMock = import.meta.env.VITE_USE_MOCK !== "false";

// 图片上传接口：POST form-data 的 file 字段，返回 data.path（OSS 相对路径）。
const IMAGE_UPLOAD_PATH = "/api/tool/upload";

// 已接入真实后端的接口在此显式覆盖 mock（例如 getClasses、各类型资源列表），
// 其余页面数据仍走 mock，避免未接入的占位路径请求失败影响页面。
export const api: ApiClient = useMock
  ? {
      ...mockApi,
      getConstants: realApi.getConstants,
      getReadingDetail: realApi.getReadingDetail,
      getReadingVocabulary: realApi.getReadingVocabulary,
      getReadingQuiz: realApi.getReadingQuiz,
      getAudioDetail: realApi.getAudioDetail,
      getVideoDetail: realApi.getVideoDetail,
      getAssignClassList: realApi.getAssignClassList,
      getClassStudents: realApi.getClassStudents,
      assignResources: realApi.assignResources,
      uploadImage: realApi.uploadImage,
      getClasses: realApi.getClasses,
      getReadingList: realApi.getReadingList,
      getAudioList: realApi.getAudioList,
      getVideoList: realApi.getVideoList,
      getWritingTaskList: realApi.getWritingTaskList,
      getWritingTaskDetail: realApi.getWritingTaskDetail,
      createWritingTask: realApi.createWritingTask,
      updateWritingTask: realApi.updateWritingTask,
    }
  : realApi;
