import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentDetailStudent, StudentDetailTab } from "@/types";

export function StudentDetailDialog({
  student,
  initialTab,
  onClose,
  renderTasksPanel,
  renderReportPanel,
  assignedIconSrc,
  reportIconSrc,
}: {
  student: StudentDetailStudent;
  initialTab: StudentDetailTab;
  onClose: () => void;
  renderTasksPanel: (student: StudentDetailStudent) => ReactNode;
  renderReportPanel: (student: StudentDetailStudent) => ReactNode;
  assignedIconSrc: string;
  reportIconSrc: string;
}) {
  const [activeTab, setActiveTab] = useState<StudentDetailTab>(initialTab);
  const [tabAnchor, setTabAnchor] = useState({ initialTab, studentName: student.name });
  if (tabAnchor.initialTab !== initialTab || tabAnchor.studentName !== student.name) {
    setTabAnchor({ initialTab, studentName: student.name });
    setActiveTab(initialTab);
  }

  return (
    <div className="feedback-backdrop" role="dialog" aria-modal="true" aria-label={`${student.name} details`}>
      <Card className="student-detail-dialog">
        <CardHeader>
          <div className="student-task-dialog-title">
            <span className="leaderboard-avatar" style={student.avatarImage ? undefined : { backgroundColor: student.color }}>
              {student.avatarImage ? <img src={student.avatarImage} alt="" /> : student.avatar}
            </span>
            <div>
              <CardDescription>{student.readingLevel}L reading level</CardDescription>
              <CardTitle>{student.name}</CardTitle>
            </div>
          </div>
          <div className="student-detail-tabs" role="tablist" aria-label={`${student.name} detail sections`}>
            <button type="button" role="tab" aria-selected={activeTab === "tasks"} onClick={() => setActiveTab("tasks")}>
              <img src={assignedIconSrc} alt="" />
              Tasks
            </button>
            <button type="button" role="tab" aria-selected={activeTab === "report"} onClick={() => setActiveTab("report")}>
              <img src={reportIconSrc} alt="" />
              Report
            </button>
          </div>
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label="Close student details" onClick={onClose}>
              <X size={18} />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="student-detail-dialog-content">
          {activeTab === "tasks" ? renderTasksPanel(student) : renderReportPanel(student)}
        </CardContent>
      </Card>
    </div>
  );
}
