import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/api";
import { useApi } from "@/hooks/useApi";
import type { Resource, ResourceType } from "@/types";
import { AssignResourceDialog, CreateWritingDialog } from "./LibraryDialogs";
import { LibraryFilters } from "./LibraryFilters";
import { ResourceGrid } from "./ResourceGrid";
import {
  DURATION_MAX,
  DURATION_MIN,
  LEXILE_MAX,
  LEXILE_MIN,
  WORDS_MAX,
  WORDS_MIN,
  filterLibraryResources,
  getLibraryPagination,
} from "./libraryUtils";

export function LibraryView() {
  const { data: resources = [] } = useApi(() => api.getResources());
  const { data: classes = [] } = useApi(() => api.getClasses());
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceType | null>(null);
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
  const [assignResource, setAssignResource] = useState<Resource | null>(null);
  const [assignClassId, setAssignClassId] = useState("");
  const [assignStudentIds, setAssignStudentIds] = useState<string[]>([]);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState("");
  const [createWritingOpen, setCreateWritingOpen] = useState(false);
  const [editingWritingResource, setEditingWritingResource] = useState<Resource | null>(null);
  const [createdWritingResources, setCreatedWritingResources] = useState<Resource[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const filterKey = `${query}|${type}|${selectedGenres.join(",")}|${selectedTopics.join(",")}|${minLexile}|${maxLexile}|${minWords}|${maxWords}|${minDuration}|${maxDuration}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setCurrentPage(1);
  }
  const resourcePool = useMemo(() => [...createdWritingResources, ...resources], [createdWritingResources, resources]);
  const libraryTopicOptions = useMemo(
    () => ["All", ...Array.from(new Set(resourcePool.map((resource) => resource.topic))).sort()],
    [resourcePool],
  );
  const createdWritingResourceIds = useMemo(
    () => new Set(createdWritingResources.map((resource) => resource.id)),
    [createdWritingResources],
  );

  const filteredResources = useMemo(() => {
    return filterLibraryResources(resourcePool, {
      query,
      type,
      selectedGenres,
      selectedTopics,
      minLexile,
      maxLexile,
      minWords,
      maxWords,
      minDuration,
      maxDuration,
    });
  }, [maxDuration, maxLexile, maxWords, minDuration, minLexile, minWords, query, resourcePool, selectedGenres, selectedTopics, type]);

  const { showCreateWritingCard, totalItemCount, totalPages, pagedResources, visiblePageNumbers } = getLibraryPagination({
    filteredResources,
    type,
    currentPage,
  });
  if (lastFilterKey === filterKey && currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  function openAssignDialog(resource: Resource) {
    setAssignResource(resource);
    setAssignClassId("");
    setAssignStudentIds([]);
    setAssignSuccessMessage("");
  }

  function changeAssignClass(classId: string) {
    setAssignClassId(classId);
    setAssignStudentIds([]);
  }

  function toggleAssignStudent(studentId: string) {
    setAssignStudentIds((currentIds) =>
      currentIds.includes(studentId)
        ? currentIds.filter((id) => id !== studentId)
        : [...currentIds, studentId],
    );
  }

  function toggleAssignAllStudents(studentIds: string[]) {
    setAssignStudentIds((currentIds) =>
      studentIds.length > 0 && studentIds.every((studentId) => currentIds.includes(studentId)) ? [] : studentIds,
    );
  }

  function confirmAssign() {
    if (!assignResource || !assignClassId || assignStudentIds.length === 0) return;

    const className = classes.find((classRoom) => classRoom.id === assignClassId)?.name ?? "class";
    setAssignSuccessMessage(
      `Assign successful: ${assignResource.title} assigned to ${assignStudentIds.length} student${
        assignStudentIds.length > 1 ? "s" : ""
      } in ${className}.`,
    );
    setAssignResource(null);
    setAssignStudentIds([]);
  }

  function createWritingResource(resource: Resource) {
    setCreatedWritingResources((current) => [resource, ...current]);
    setCreateWritingOpen(false);
    setType("Writing");
    setAssignSuccessMessage(`Writing created: ${resource.title}.`);
  }

  function updateWritingResource(resource: Resource) {
    setCreatedWritingResources((current) => current.map((item) => (item.id === resource.id ? resource : item)));
    setEditingWritingResource(null);
    setType("Writing");
    setAssignSuccessMessage(`Writing updated: ${resource.title}.`);
  }

  return (
    <main className="workspace library-workspace">
      {assignSuccessMessage && (
        <Card className="assign-success" role="status">
          <CardContent className="flex items-center justify-between gap-4 py-4">
            <span>{assignSuccessMessage}</span>
            <Button variant="ghost" size="sm" onClick={() => setAssignSuccessMessage("")}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {assignResource && (
        <AssignResourceDialog
          resource={assignResource}
          classes={classes}
          selectedClassId={assignClassId}
          selectedStudentIds={assignStudentIds}
          onClassChange={changeAssignClass}
          onStudentToggle={toggleAssignStudent}
          onStudentSelectAll={toggleAssignAllStudents}
          onClose={() => setAssignResource(null)}
          onAssign={confirmAssign}
        />
      )}

      {createWritingOpen && (
        <CreateWritingDialog
          onClose={() => setCreateWritingOpen(false)}
          onSave={createWritingResource}
        />
      )}

      {editingWritingResource && (
        <CreateWritingDialog
          resource={editingWritingResource}
          onClose={() => setEditingWritingResource(null)}
          onSave={updateWritingResource}
        />
      )}

      <section className="library-layout">
        <LibraryFilters
          query={query}
          type={type}
          selectedGenres={selectedGenres}
          selectedTopics={selectedTopics}
          genreOpen={genreOpen}
          topicOpen={topicOpen}
          topicOptions={libraryTopicOptions}
          minLexile={minLexile}
          maxLexile={maxLexile}
          minWords={minWords}
          maxWords={maxWords}
          minDuration={minDuration}
          maxDuration={maxDuration}
          onQueryChange={setQuery}
          onTypeChange={setType}
          onGenresChange={setSelectedGenres}
          onTopicsChange={setSelectedTopics}
          onGenreOpenChange={setGenreOpen}
          onTopicOpenChange={setTopicOpen}
          onMinLexileChange={setMinLexile}
          onMaxLexileChange={setMaxLexile}
          onMinWordsChange={setMinWords}
          onMaxWordsChange={setMaxWords}
          onMinDurationChange={setMinDuration}
          onMaxDurationChange={setMaxDuration}
        />

        <ResourceGrid
          resources={pagedResources}
          showCreateWritingCard={showCreateWritingCard}
          totalPages={totalPages}
          totalItemCount={totalItemCount}
          currentPage={currentPage}
          visiblePageNumbers={visiblePageNumbers}
          createdWritingResourceIds={createdWritingResourceIds}
          onCreateWriting={() => setCreateWritingOpen(true)}
          onAssignResource={openAssignDialog}
          onEditWritingResource={setEditingWritingResource}
          onPageChange={setCurrentPage}
        />
      </section>
    </main>
  );
}
