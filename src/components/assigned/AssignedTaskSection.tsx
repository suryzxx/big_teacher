import { useState } from "react";
import { AssignedTaskSummaryCard } from "./overview/AssignedOverviewCards";
import { toStudentDetailStudent } from "./overview/AssignedLeaderboard";
import { LeaderboardCard } from "./overview/AssignedLeaderboard";
import { api } from "@/api";
import { useApi } from "@/hooks/useApi";
import { AssignedTaskListCard } from "./AssignedTaskList";
import { AssignTaskDialog, AssignTaskLaunchCard } from "./AssignWorkflow";
import type { StudentDetailStudent, StudentDetailTab } from "@/types";

export function AssignedTaskSection({
  onOpenTaskStudent,
}: {
  onOpenTaskStudent: (student: StudentDetailStudent, tab?: StudentDetailTab) => void;
}) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { data: rowsByWeek = {} } = useApi(() => api.getAssignedTaskRowsByWeek());
  const { data: leaderboard = [] } = useApi(() => api.getCompletionLeaderboard());

  return (
    <section className="assigned-dashboard">
      {assignDialogOpen && <AssignTaskDialog onClose={() => setAssignDialogOpen(false)} />}
      <div className="assigned-overview-grid" aria-label="Assigned task overview">
        <div className="assigned-work-area">
          <div className="assigned-task-list-area">
            <AssignedTaskListCard />
          </div>
        </div>

        <aside className="assigned-side-area">
          <div className="assigned-task-action-row">
            <AssignedTaskSummaryCard rowsByWeek={rowsByWeek} />
            <AssignTaskLaunchCard onOpen={() => setAssignDialogOpen(true)} />
          </div>
          <LeaderboardCard students={leaderboard} onOpenStudent={onOpenTaskStudent} toStudentDetail={toStudentDetailStudent} />
        </aside>
      </div>
    </section>
  );
}
