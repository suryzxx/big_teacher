import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/api";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import type {
  AssignClass,
  AssignStudent,
  AudioDetail,
  AudioResource,
  ConstantsData,
  ReadingDetailArticle,
  ReadingQuizItem,
  ReadingResource,
  ReadingVocabularyItem,
  Resource,
  ResourceGenre,
  ResourceType,
  VideoDetail,
  VideoResource,
  WritingTask,
  WritingTaskFormDraft,
} from "@/types";

// Assign 弹窗的班级列表缓存：已拉取过就不再重复请求
let cachedAssignClasses: AssignClass[] | null = null;
import { AssignResourceDialog, CreateWritingDialog } from "./LibraryDialogs";
import { ReadingPreviewDialog } from "./ReadingPreviewDialog";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { LibraryFilters } from "./LibraryFilters";
import { CreateWritingCard, ResourceCard } from "./ResourceCard";
import {
  DURATION_MAX,
  DURATION_MIN,
  LEXILE_MAX,
  LEXILE_MIN,
  WORDS_MAX,
  WORDS_MIN,
} from "./libraryUtils";

const PAGE_SIZE = 21;

function formatMinutes(totalSeconds?: number): string {
  if (!totalSeconds || totalSeconds <= 0) return "";
  return `${Math.max(1, Math.round(totalSeconds / 60))} min`;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function PaginationArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {direction === "left" ? (
        <path
          d="M15 19.92L8.48 13.4C7.71 12.63 7.71 11.37 8.48 10.6L15 4.07996"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M8.91 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.91 4.07996"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// 数据量可能很大（reading 上万条），只展示当前页附近的页码，超出的用省略号。
function getVisiblePages(current: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const candidates = [1, 2, current - 1, current, current + 1, totalPages - 1, totalPages];
  const pages = [...new Set(candidates.filter((page) => page >= 1 && page <= totalPages))].sort((a, b) => a - b);
  const result: Array<number | "…"> = [];
  let previous = 0;
  for (const page of pages) {
    if (previous > 0 && page - previous > 1) result.push("…");
    result.push(page);
    previous = page;
  }
  return result;
}

// 把各类型接口返回项映射成原版 ResourceCard 需要的 Resource 结构。
// 接口缺失的字段（如 reading 的 genre、writing 的 lexile）先用占位值，
// 待后端补充后可直接替换对应行。
function toResource(
  item: ReadingResource | AudioResource | VideoResource | WritingTask,
  type: ResourceType,
): Resource {
  if (type === "Reading") {
    const reading = item as ReadingResource;
    return {
      id: String(reading.id),
      title: reading.title,
      type: "Reading",
      // 右上角 genre 标签用接口的 subject（如 News / Informational Text）
      genre: (reading.subject || "Reading") as ResourceGenre,
      topic: reading.topic,
      lexile: reading.lexile_num,
      coverImage: resolveMediaUrl(reading.img) ?? "",
      description: reading.content,
      tags: [],
      wordCount: reading.wordcount,
    };
  }
  if (type === "Podcast") {
    const audio = item as AudioResource;
    return {
      id: String(audio.id),
      title: audio.title,
      type: "Podcast",
      genre: (audio.category || "Podcast") as ResourceGenre,
      topic: audio.topic ?? "",
      lexile: audio.lexile_num ?? 0,
      coverImage: resolveMediaUrl(audio.cover) ?? "",
      description: audio.detailed_script ?? "",
      tags: [],
      duration: formatMinutes(audio.time_length),
    };
  }
  if (type === "Video") {
    const video = item as VideoResource;
    return {
      id: String(video.id),
      title: video.title,
      type: "Video",
      genre: (video.category || "Video") as ResourceGenre,
      topic: video.topic ?? "",
      lexile: video.lexile_num ?? 0,
      coverImage: resolveMediaUrl(video.cover) ?? "",
      description: video.summary ?? video.detailed_script ?? "",
      tags: [],
      duration: formatMinutes(video.time_length),
    };
  }
  const writing = item as WritingTask;
  return {
    id: String(writing.id),
    title: writing.name,
    type: "Writing",
    genre: (writing.genre || "Writing") as ResourceGenre,
    topic: "",
    lexile: 0,
    grades: writing.grades,
    coverImage: resolveMediaUrl(writing.avatar) ?? "",
    description: writing.content,
    tags: [],
    wordCount: countWords(writing.content),
  };
}

export function LibraryView() {
  const [type, setType] = useState<ResourceType | null>(null);
  const [items, setItems] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [createWritingOpen, setCreateWritingOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSaving, setPreviewSaving] = useState(false);
  const [previewTask, setPreviewTask] = useState<WritingTask | null>(null);
  const [readingPreviewOpen, setReadingPreviewOpen] = useState(false);
  const [readingPreviewLoading, setReadingPreviewLoading] = useState(false);
  const [readingPreviewError, setReadingPreviewError] = useState<string | null>(null);
  const [readingPreviewDetail, setReadingPreviewDetail] = useState<ReadingDetailArticle | null>(null);
  const [readingPreviewVocabulary, setReadingPreviewVocabulary] = useState<ReadingVocabularyItem[]>([]);
  const [readingPreviewQuiz, setReadingPreviewQuiz] = useState<ReadingQuizItem[]>([]);
  const [mediaPreviewOpen, setMediaPreviewOpen] = useState(false);
  const [mediaPreviewLoading, setMediaPreviewLoading] = useState(false);
  const [mediaPreviewError, setMediaPreviewError] = useState<string | null>(null);
  const [mediaPreviewKind, setMediaPreviewKind] = useState<"Podcast" | "Video">("Podcast");
  const [mediaPreviewDetail, setMediaPreviewDetail] = useState<AudioDetail | VideoDetail | null>(null);
  const [assignResource, setAssignResource] = useState<Resource | null>(null);
  const [assignClassId, setAssignClassId] = useState("");
  const [assignStudentIds, setAssignStudentIds] = useState<string[]>([]);
  const [assignClasses, setAssignClasses] = useState<AssignClass[]>([]);
  const [assignClassesLoading, setAssignClassesLoading] = useState(false);
  const [assignStudents, setAssignStudents] = useState<AssignStudent[]>([]);
  const [assignStudentsLoading, setAssignStudentsLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const requestSeq = useRef(0);
  const writingTaskIdMap = useRef(new Map<string, string>());
  const readingHashIdMap = useRef(new Map<string, string>());
  const audioHashIdMap = useRef(new Map<string, string>());
  const videoHashIdMap = useRef(new Map<string, string>());
  const filterTimer = useRef<number | null>(null);
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [constants, setConstants] = useState<ConstantsData | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["All"]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["All"]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [topicOpen, setTopicOpen] = useState(false);
  const [minLexile, setMinLexile] = useState(LEXILE_MIN);
  const [maxLexile, setMaxLexile] = useState(LEXILE_MAX);
  const [minWords, setMinWords] = useState(WORDS_MIN);
  const [maxWords, setMaxWords] = useState(WORDS_MAX);
  const [minDuration, setMinDuration] = useState(DURATION_MIN);
  const [maxDuration, setMaxDuration] = useState(DURATION_MAX);
  // 记录最新的过滤条件，防抖回调/异步请求从 ref 读取，避免闭包读到旧值
  const latestFiltersRef = useRef({
    query,
    selectedGenres,
    selectedTopics,
    minLexile,
    maxLexile,
    minWords,
    maxWords,
    minDuration,
    maxDuration,
  });

  useEffect(() => {
    latestFiltersRef.current = {
      query,
      selectedGenres,
      selectedTopics,
      minLexile,
      maxLexile,
      minWords,
      maxWords,
      minDuration,
      maxDuration,
    };
  });

  // Genre 选项来自 OSS 静态文件 const.js，按资源类型取对应全局变量
  const readingTypeOptions = useMemo(
    () => ["All", ...(window.READING_TYPE ?? []).map((item) => item.value)],
    [],
  );
  const writingTypeOptions = useMemo(
    () => ["All", ...(window.WRITING_TYPE ?? []).map((item) => item.value)],
    [],
  );
  const otherTypeOptions = useMemo(
    () => ["All", ...(window.RESOURCE_OTHER_TYPE ?? []).map((item) => item.value)],
    [],
  );
  const genreOptions =
    type === "Writing" ? writingTypeOptions : type === "Podcast" || type === "Video" ? otherTypeOptions : readingTypeOptions;

  // Topic 选项来自 GET /constants 的 data.topic
  const topicOptions = useMemo(
    () => ["All", ...(constants?.topic ?? []).map((item) => item.value)],
    [constants],
  );

  useEffect(() => {
    let cancelled = false;
    api
      .getConstants()
      .then((data) => {
        if (!cancelled) setConstants(data);
      })
      .catch((err) => console.warn("加载 constants 失败", err));
    return () => {
      cancelled = true;
    };
  }, []);

  // 轻提示：2.5 秒后自动消失
  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function scheduleFilterReload() {
    if (!type) return;
    if (filterTimer.current !== null) window.clearTimeout(filterTimer.current);
    filterTimer.current = window.setTimeout(() => {
      filterTimer.current = null;
      setPage(1);
      void loadResources(type, 1);
    }, 300);
  }

  function changeQuery(value: string) {
    // 搜索改为显式提交：输入只更新本地值，点图标或回车才触发查询
    setQueryInput(value);
  }

  function submitSearch() {
    setQuery(queryInput.trim());
    if (!type) return;
    if (filterTimer.current !== null) {
      window.clearTimeout(filterTimer.current);
      filterTimer.current = null;
    }
    setPage(1);
    setItems([]);
    setTotal(0);
    void loadResources(type, 1, queryInput.trim());
  }

  function changeGenres(values: string[]) {
    setSelectedGenres(values);
    scheduleFilterReload();
  }

  function changeTopics(values: string[]) {
    setSelectedTopics(values);
    scheduleFilterReload();
  }

  function changeMinLexile(value: number) {
    setMinLexile(value);
    scheduleFilterReload();
  }

  function changeMaxLexile(value: number) {
    setMaxLexile(value);
    scheduleFilterReload();
  }

  function changeMinWords(value: number) {
    setMinWords(value);
    scheduleFilterReload();
  }

  function changeMaxWords(value: number) {
    setMaxWords(value);
    scheduleFilterReload();
  }

  function changeMinDuration(value: number) {
    setMinDuration(value);
    scheduleFilterReload();
  }

  function changeMaxDuration(value: number) {
    setMaxDuration(value);
    scheduleFilterReload();
  }

  async function loadResources(
    resourceType: ResourceType,
    targetPage: number,
    searchQuery = latestFiltersRef.current.query,
  ) {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const filters = latestFiltersRef.current;
      let nextTotal = 0;
      let nextItems: Resource[] = [];
      if (resourceType === "Reading") {
        const result = await api.getReadingList({
          page: targetPage,
          page_size: PAGE_SIZE,
          content: searchQuery.trim(),
          topic: filters.selectedTopics.includes("All") ? "" : filters.selectedTopics.join(","),
          subject: filters.selectedGenres.includes("All") ? "" : filters.selectedGenres.join(","),
          lx_type: "lx",
          // 后端要求两侧都不能为空串才过滤；边界值用滑块范围 0 / 1200（"0" 等效不设下限）
          min_lx: String(filters.minLexile),
          max_lx: String(filters.maxLexile),
          resource_type: "reading",
          min_wordcount: filters.minWords > WORDS_MIN ? filters.minWords : undefined,
          max_wordcount: filters.maxWords < WORDS_MAX ? filters.maxWords : undefined,
        });
        nextTotal = result.total;
        nextItems = result.list.map((item) => toResource(item, resourceType));
        readingHashIdMap.current.clear();
        result.list.forEach((item) => readingHashIdMap.current.set(String(item.id), item.hash_id));
      } else if (resourceType === "Podcast") {
        const result = await api.getAudioList({
          page: targetPage,
          page_size: PAGE_SIZE,
          title: searchQuery.trim(),
          topic: filters.selectedTopics.includes("All") ? "" : filters.selectedTopics.join(","),
          subject: filters.selectedGenres.includes("All") ? "" : filters.selectedGenres.join(","),
          lx_type: "lx",
          min_lx: String(filters.minLexile),
          max_lx: String(filters.maxLexile),
          resource_type: "audio",
          min_time_length: filters.minDuration > DURATION_MIN ? filters.minDuration * 60 : undefined,
          max_time_length: filters.maxDuration < DURATION_MAX ? filters.maxDuration * 60 : undefined,
        });
        nextTotal = result.total;
        nextItems = result.list.map((item) => toResource(item, resourceType));
        audioHashIdMap.current.clear();
        result.list.forEach((item) => audioHashIdMap.current.set(String(item.id), item.hash_id));
      } else if (resourceType === "Video") {
        const result = await api.getVideoList({
          page: targetPage,
          page_size: PAGE_SIZE,
          title: searchQuery.trim(),
          topic: filters.selectedTopics.includes("All") ? "" : filters.selectedTopics.join(","),
          subject: filters.selectedGenres.includes("All") ? "" : filters.selectedGenres.join(","),
          lx_type: "lx",
          min_lx: String(filters.minLexile),
          max_lx: String(filters.maxLexile),
          resource_type: "video",
          min_time_length: filters.minDuration > DURATION_MIN ? filters.minDuration * 60 : undefined,
          max_time_length: filters.maxDuration < DURATION_MAX ? filters.maxDuration * 60 : undefined,
        });
        nextTotal = result.total;
        nextItems = result.list.map((item) => toResource(item, resourceType));
        videoHashIdMap.current.clear();
        result.list.forEach((item) => videoHashIdMap.current.set(String(item.id), item.hash_id));
      } else {
        const result = await api.getWritingTaskList({
          page: targetPage,
          category: 1,
          ...(searchQuery.trim() ? { keyword: searchQuery.trim() } : {}),
          ...(filters.selectedGenres.includes("All") ? {} : { genre: filters.selectedGenres.join(",") }),
        });
        nextTotal = result.total;
        nextItems = result.list.map((item) => toResource(item, resourceType));
        writingTaskIdMap.current.clear();
        result.list.forEach((item) => writingTaskIdMap.current.set(String(item.id), item.task_id));
      }
      if (seq !== requestSeq.current) return;
      setItems(nextItems);
      setTotal(nextTotal);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setItems([]);
      setError(err instanceof Error ? err.message : "加载失败，请稍后重试");
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }

  function handleTypeChange(nextType: ResourceType | null) {
    if (filterTimer.current !== null) {
      window.clearTimeout(filterTimer.current);
      filterTimer.current = null;
    }
    if (nextType === null || nextType === type) {
      // 再次点击同一类型：取消选择，回到提示态
      requestSeq.current += 1;
      setType(null);
      setItems([]);
      setTotal(0);
      setPage(1);
      setError(null);
      setLoading(false);
      return;
    }
    setType(nextType);
    setPage(1);
    setItems([]);
    setTotal(0);
    void loadResources(nextType, 1);
  }

  function handlePageChange(nextPage: number) {
    if (!type || nextPage === page) return;
    setPage(nextPage);
    void loadResources(type, nextPage);
  }

  async function handleCreateWriting(draft: WritingTaskFormDraft) {
    setCreating(true);
    setCreateError(null);
    try {
      let avatar: string | undefined;
      if (draft.avatarFile) {
        avatar = await api.uploadImage(draft.avatarFile);
      }
      await api.createWritingTask({
        name: draft.name,
        content: draft.content,
        grades: draft.grades,
        genre: draft.genre,
        recommended: draft.recommended,
        folder_id: draft.folder_id,
        category: draft.category,
        avatar,
      });
      setCreateWritingOpen(false);
      setSuccessMessage(`Writing created: ${draft.name}`);
      if (type === "Writing") {
        setPage(1);
        setItems([]);
        void loadResources("Writing", 1);
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "创建失败，请稍后重试");
    } finally {
      setCreating(false);
    }
  }

  async function handlePreviewWriting(resource: Resource) {
    const taskId = writingTaskIdMap.current.get(resource.id);
    if (!taskId) return;
    setPreviewError(null);
    setPreviewTask(null);
    try {
      const task = await api.getWritingTaskDetail(taskId);
      setPreviewTask(task);
      setPreviewOpen(true);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "加载详情失败");
      setPreviewOpen(true);
    }
  }

  async function handlePreviewReading(resource: Resource) {
    const hashId = readingHashIdMap.current.get(resource.id);
    if (!hashId) return;
    setReadingPreviewOpen(true);
    setReadingPreviewLoading(true);
    setReadingPreviewError(null);
    setReadingPreviewDetail(null);
    setReadingPreviewVocabulary([]);
    setReadingPreviewQuiz([]);
    try {
      const [detail, vocabulary, quiz] = await Promise.all([
        api.getReadingDetail(hashId),
        api.getReadingVocabulary(hashId),
        api.getReadingQuiz(hashId),
      ]);
      setReadingPreviewDetail(detail.article_info);
      setReadingPreviewVocabulary(vocabulary);
      setReadingPreviewQuiz(quiz);
    } catch (err) {
      setReadingPreviewError(err instanceof Error ? err.message : "加载预览失败");
    } finally {
      setReadingPreviewLoading(false);
    }
  }

  async function handlePreviewMedia(resource: Resource, kind: "Podcast" | "Video") {
    const hashId =
      kind === "Podcast"
        ? audioHashIdMap.current.get(resource.id)
        : videoHashIdMap.current.get(resource.id);
    if (!hashId) return;
    setMediaPreviewOpen(true);
    setMediaPreviewLoading(true);
    setMediaPreviewError(null);
    setMediaPreviewDetail(null);
    setMediaPreviewKind(kind);
    try {
      const detail = kind === "Podcast" ? await api.getAudioDetail(hashId) : await api.getVideoDetail(hashId);
      setMediaPreviewDetail(detail);
    } catch (err) {
      setMediaPreviewError(err instanceof Error ? err.message : "加载预览失败");
    } finally {
      setMediaPreviewLoading(false);
    }
  }

  async function handleSaveWritingTask(draft: WritingTaskFormDraft) {
    setPreviewSaving(true);
    setPreviewError(null);
    try {
      let avatar: string | undefined = draft.existingAvatar;
      if (draft.avatarFile) {
        avatar = await api.uploadImage(draft.avatarFile);
      }
      const params = {
        task_id: draft.task_id!,
        name: draft.name,
        content: draft.content,
        grades: draft.grades,
        genre: draft.genre,
        recommended: draft.recommended,
        folder_id: draft.folder_id,
        category: draft.category,
        avatar,
        imgs: draft.existingImgs ?? null,
      };
      await api.updateWritingTask(params);
      setPreviewOpen(false);
      setSuccessMessage(`Writing updated: ${params.name}`);
      if (type === "Writing") {
        setPage(1);
        setItems([]);
        void loadResources("Writing", 1);
      }
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "保存失败，请稍后重试");
    } finally {
      setPreviewSaving(false);
    }
  }

  async function openAssignDialog(resource: Resource) {
    setAssignResource(resource);
    setAssignClassId("");
    setAssignStudentIds([]);
    setAssignStudents([]);
    setAssignError(null);
    if (cachedAssignClasses) {
      setAssignClasses(cachedAssignClasses);
      return;
    }
    setAssignClassesLoading(true);
    try {
      const classList = await api.getAssignClassList();
      cachedAssignClasses = classList;
      setAssignClasses(classList);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "加载班级失败");
    } finally {
      setAssignClassesLoading(false);
    }
  }

  async function changeAssignClass(classId: string) {
    setAssignClassId(classId);
    setAssignStudentIds([]);
    setAssignStudents([]);
    setAssignError(null);
    setAssignStudentsLoading(true);
    try {
      const students = await api.getClassStudents(Number(classId));
      setAssignStudents(students);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "加载学生失败");
    } finally {
      setAssignStudentsLoading(false);
    }
  }

  function toggleAssignStudent(studentId: string) {
    setAssignStudentIds((currentIds) =>
      currentIds.includes(studentId) ? currentIds.filter((id) => id !== studentId) : [...currentIds, studentId],
    );
  }

  function toggleAssignAllStudents(studentIds: string[]) {
    setAssignStudentIds((currentIds) =>
      studentIds.length > 0 && studentIds.every((studentId) => currentIds.includes(studentId)) ? [] : studentIds,
    );
  }

  async function confirmAssign() {
    if (!assignResource || !assignClassId || assignStudentIds.length === 0 || !type) return;
    const resourceId =
      readingHashIdMap.current.get(assignResource.id) ??
      audioHashIdMap.current.get(assignResource.id) ??
      videoHashIdMap.current.get(assignResource.id) ??
      writingTaskIdMap.current.get(assignResource.id);
    if (!resourceId) return;
    const resourceType = type === "Reading" ? "reading" : type === "Podcast" ? "audio" : type === "Video" ? "video" : "writing";
    setAssignSubmitting(true);
    setAssignError(null);
    try {
      await api.assignResources(
        assignStudentIds.map((studentId) => ({
          uid: Number(studentId),
          class_id: Number(assignClassId),
          resource_id: resourceId,
          resource_type: resourceType,
        })),
      );
      const className = assignClasses.find((classRoom) => String(classRoom.id) === assignClassId)?.name ?? "class";
      setSuccessMessage(
        `Assign successful: ${assignResource.title} assigned to ${assignStudentIds.length} student${
          assignStudentIds.length > 1 ? "s" : ""
        } in ${className}.`,
      );
      setAssignResource(null);
      setAssignStudentIds([]);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "分配失败，请稍后重试");
    } finally {
      setAssignSubmitting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <main className="workspace library-workspace">
      {successMessage && (
        <Card className="assign-success" role="status">
          <CardContent className="flex items-center justify-between gap-3">
            <span>{successMessage}</span>
            <Button variant="ghost" size="sm" onClick={() => setSuccessMessage("")}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="library-layout">
        <LibraryFilters
          query={queryInput}
          type={type}
          selectedGenres={selectedGenres}
          selectedTopics={selectedTopics}
          genreOpen={genreOpen}
          topicOpen={topicOpen}
          topicOptions={topicOptions}
          genreOptions={genreOptions}
          minLexile={minLexile}
          maxLexile={maxLexile}
          minWords={minWords}
          maxWords={maxWords}
          minDuration={minDuration}
          maxDuration={maxDuration}
          onQueryChange={changeQuery}
          onSearchSubmit={submitSearch}
          onTypeChange={handleTypeChange}
          onGenresChange={changeGenres}
          onTopicsChange={changeTopics}
          onGenreOpenChange={setGenreOpen}
          onTopicOpenChange={setTopicOpen}
          onMinLexileChange={changeMinLexile}
          onMaxLexileChange={changeMaxLexile}
          onMinWordsChange={changeMinWords}
          onMaxWordsChange={changeMaxWords}
          onMinDurationChange={changeMinDuration}
          onMaxDurationChange={changeMaxDuration}
        />

        <div className="library-main">
          {type === null ? (
            <div className="library-empty-hint">请先选择资源类型</div>
          ) : error ? (
            <div className="library-empty-hint">
              <span>{error}</span>
              <Button type="button" variant="outline" size="sm" onClick={() => loadResources(type, page)}>
                重试
              </Button>
            </div>
          ) : loading && items.length === 0 ? (
            <div className="library-empty-hint">加载中…</div>
          ) : items.length === 0 ? (
            <div className="library-empty-hint">暂无数据</div>
          ) : (
            <>
              <section className="resource-grid">
                {type === "Writing" && page === 1 && <CreateWritingCard onCreate={() => setCreateWritingOpen(true)} />}
                {items.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onAssign={openAssignDialog}
                    onPreview={
                      type === "Reading"
                        ? handlePreviewReading
                        : type === "Podcast"
                          ? (resource) => handlePreviewMedia(resource, "Podcast")
                          : type === "Video"
                            ? (resource) => handlePreviewMedia(resource, "Video")
                            : type === "Writing"
                              ? handlePreviewWriting
                              : undefined
                    }
                  />
                ))}
              </section>
              {totalPages > 1 && (
                <nav className="library-pagination" aria-label="Resource pagination">
                  <span>Total {total} items</span>
                  <div className="library-page-controls">
                    <button
                      type="button"
                      className="library-page-arrow"
                      disabled={page === 1}
                      aria-label="Previous page"
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                    >
                      <PaginationArrow direction="left" />
                    </button>
                    {visiblePages.map((pageNumber, index) =>
                      pageNumber === "…" ? (
                        <span key={`gap-${index}`} className="library-page-gap">
                          …
                        </span>
                      ) : (
                        <button
                          key={pageNumber}
                          type="button"
                          className="library-page-number"
                          aria-current={page === pageNumber ? "page" : undefined}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      className="library-page-arrow"
                      disabled={page === totalPages}
                      aria-label="Next page"
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    >
                      <PaginationArrow direction="right" />
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      {createWritingOpen && (
        <CreateWritingDialog
          onClose={() => setCreateWritingOpen(false)}
          onSubmit={handleCreateWriting}
          submitting={creating}
          error={createError}
        />
      )}

      {previewOpen && (
        previewTask ? (
          <CreateWritingDialog
            key={previewTask.task_id}
            task={previewTask}
            onClose={() => setPreviewOpen(false)}
            onSubmit={handleSaveWritingTask}
            submitting={previewSaving}
            error={previewError}
          />
        ) : (
          <div className="writing-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Writing Task">
            <Card className="writing-detail-dialog">
              <CardHeader>
                <CardTitle>Writing Task</CardTitle>
                <CardAction>
                  <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={() => setPreviewOpen(false)}>
                    <X size={18} />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="writing-detail-content">
                <p className="writing-detail-error">{previewError}</p>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {readingPreviewOpen && (
        <ReadingPreviewDialog
          detail={readingPreviewDetail}
          vocabulary={readingPreviewVocabulary}
          quiz={readingPreviewQuiz}
          loading={readingPreviewLoading}
          error={readingPreviewError}
          onClose={() => setReadingPreviewOpen(false)}
        />
      )}

      {mediaPreviewOpen && (
        <MediaPreviewDialog
          media={mediaPreviewDetail}
          kind={mediaPreviewKind}
          loading={mediaPreviewLoading}
          error={mediaPreviewError}
          onClose={() => setMediaPreviewOpen(false)}
        />
      )}

      {assignResource && (
        <AssignResourceDialog
          resource={assignResource}
          classes={assignClasses}
          students={assignStudents}
          studentsLoading={assignStudentsLoading}
          classLoading={assignClassesLoading}
          error={assignError}
          submitting={assignSubmitting}
          selectedClassId={assignClassId}
          selectedStudentIds={assignStudentIds}
          onClassChange={changeAssignClass}
          onStudentToggle={toggleAssignStudent}
          onStudentSelectAll={toggleAssignAllStudents}
          onClose={() => setAssignResource(null)}
          onAssign={confirmAssign}
        />
      )}
    </main>
  );
}
