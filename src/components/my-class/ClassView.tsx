import { useState } from "react";
import { myClassSections, type MyClassSection } from "@/data";
import { api } from "@/api";
import { TypeFilterIcon } from "@/components/shared/TypeFilterIcon";
import { AssignedTaskSection } from "@/components/assigned/AssignedTaskSection";
import { StudentTasksPanel } from "@/components/assigned/overview/AssignedStudentTasks";
import { MyClassSummaryCard } from "@/components/assigned/overview/AssignedOverviewCards";
import { StudentSection } from "@/components/my-class/students/StudentSection";
import { StudentDetailDialog } from "@/components/reports/StudentDetailDialog";
import { LexileArSection, ReportStudentPanel, getStudentDetailFromDirectory } from "@/components/reports/LexileReport";
import { useApi } from "@/hooks/useApi";
import type { StudentDetailStudent, StudentDetailTab, StudentDirectoryEntry } from "@/types";

export function ClassView() {
  const { data: fetchedStudents = [] } = useApi(() => api.getStudentDirectory());
  const { data: taskRows = [] } = useApi(() => api.getAssignedTaskRows());
  const { data: completionLeaderboard = [] } = useApi(() => api.getCompletionLeaderboard());
  const { data: reportLeaderboard = [] } = useApi(() => api.getLexileLeaderboard());
  const [activeSection, setActiveSection] = useState<MyClassSection>("assigned");
  const [students, setStudents] = useState<StudentDirectoryEntry[] | null>(null);
  const [activeStudentDetail, setActiveStudentDetail] = useState<StudentDetailStudent | null>(null);
  const [activeStudentDetailTab, setActiveStudentDetailTab] = useState<StudentDetailTab>("tasks");
  const [reportTimeRange, setReportTimeRange] = useState<"week" | "month" | "semester">("month");
  if (students === null && fetchedStudents.length > 0) setStudents(fetchedStudents);
  const activeStudents = students ?? [];

  function updateStudentLexileAr(studentId: string, values: Pick<StudentDirectoryEntry, "lexile" | "ar">) {
    setStudents((currentStudents) => (currentStudents ?? []).map((student) => (student.id === studentId ? { ...student, ...values } : student)));
  }

  function viewStudentDetail(student: StudentDirectoryEntry) {
    setActiveStudentDetail(getStudentDetailFromDirectory(student, completionLeaderboard, reportLeaderboard));
    setActiveStudentDetailTab("tasks");
  }

  function openStudentDetail(student: StudentDetailStudent, tab: StudentDetailTab = "tasks") {
    setActiveStudentDetail(student);
    setActiveStudentDetailTab(tab);
  }

  return (
    <main className="workspace myclass-workspace">
      <section className="myclass-summary-grid" aria-label="MyClass sections">
        {myClassSections.map((section) => (
          <MyClassSummaryCard key={section.key} section={section} isActive={activeSection === section.key} onSelect={() => setActiveSection(section.key)} />
        ))}
      </section>

      {activeSection === "students" && <StudentSection students={activeStudents} onUpdateStudent={updateStudentLexileAr} onViewDetail={viewStudentDetail} />}
      {activeSection === "assigned" && <AssignedTaskSection onOpenTaskStudent={openStudentDetail} />}
      {activeSection === "lexile" && <LexileArSection onOpenStudent={openStudentDetail} timeRange={reportTimeRange} onTimeRangeChange={setReportTimeRange} />}

      {activeStudentDetail && (
        <StudentDetailDialog
          student={activeStudentDetail}
          initialTab={activeStudentDetailTab}
          onClose={() => setActiveStudentDetail(null)}
          assignedIconSrc={`${import.meta.env.BASE_URL}myclass-icons/assigned-tasks.png`}
          reportIconSrc={`${import.meta.env.BASE_URL}myclass-icons/lexile-ar.png`}
          renderTasksPanel={(student) => (
            <StudentTasksPanel
              student={student}
              rows={taskRows}
              renderTypeIcon={(type) => <TypeFilterIcon type={type} />}
            />
          )}
          renderReportPanel={(student) => <ReportStudentPanel student={student} timeRange={reportTimeRange} />}
        />
      )}
    </main>
  );
}
