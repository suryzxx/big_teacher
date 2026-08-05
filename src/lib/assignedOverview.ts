import type { CompletionLeaderboardStudent, Student, StudentDirectoryEntry } from "@/types";

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function createCompletionLeaderboard(students: Student[]): CompletionLeaderboardStudent[] {
  return [...students]
    .sort((a, b) => b.completionRate - a.completionRate || b.weeklyMinutes - a.weeklyMinutes)
    .map((student, index) => {
      const total = 8 + (index % 3);
      const completed = Math.min(total, Math.round((student.completionRate / 100) * total));
      const remaining = total - completed;
      const inProgress = Math.min(remaining, student.risk === "High" ? 1 : student.risk === "Medium" ? 2 : index % 2);
      const notStarted = Math.max(0, remaining - inProgress);

      return {
        id: student.id,
        rank: index + 1,
        name: student.name,
        avatar: getInitials(student.name),
        avatarImage: student.avatarImage,
        readingLevel: student.readingLevel,
        tasks: student.tasks,
        completed,
        inProgress,
        notStarted,
        done: completed,
        total,
        rate: student.completionRate,
        color: student.avatarColor,
      };
    });
}

export function getCompletionStudentFromDirectory(
  student: StudentDirectoryEntry,
  leaderboard: CompletionLeaderboardStudent[],
): CompletionLeaderboardStudent {
  const matchedStudent = leaderboard.find((item) => item.name === student.name) ?? leaderboard[0];

  return {
    ...matchedStudent,
    name: student.name,
    avatar: getInitials(student.name),
    avatarImage: student.avatarImage,
    readingLevel: student.lexile,
    color: student.avatarColor,
  };
}
