import type { LexileLeaderboardStudent, StudentDirectoryEntry } from "@/types";

export const lexileTrend = [
  { label: "Jan", lexile: 680, ar: 3.2 },
  { label: "Feb", lexile: 720, ar: 3.5 },
  { label: "Mar", lexile: 780, ar: 3.9 },
  { label: "Apr", lexile: 860, ar: 4.4 },
  { label: "May", lexile: 930, ar: 4.8 },
  { label: "Jun", lexile: 1000, ar: 5.1 },
];

export const lexileLeaderboardSeeds = [
  { rank: 1, name: "Sophia Patel", lexile: 1280, ar: 6.2, trend: 150, accuracy: 94 },
  { rank: 2, name: "Ethan Kim", lexile: 1180, ar: 5.8, trend: 190, accuracy: 91 },
  { rank: 3, name: "Mia Rodriguez", lexile: 1040, ar: 5.4, trend: 160, accuracy: 88 },
  { rank: 4, name: "Aaliyah Johnson", lexile: 1000, ar: 5.1, trend: 120, accuracy: 86 },
  { rank: 5, name: "Liam Chen", lexile: 960, ar: 4.9, trend: 110, accuracy: 84 },
  { rank: 6, name: "Noah Thompson", lexile: 940, ar: 4.7, trend: 95, accuracy: 82 },
  { rank: 7, name: "Olivia Martinez", lexile: 910, ar: 4.5, trend: 88, accuracy: 80 },
];

export function createLexileLeaderboard(
  students: StudentDirectoryEntry[],
  getInitials: (name: string) => string,
): LexileLeaderboardStudent[] {
  return lexileLeaderboardSeeds.map((student) => {
    const directoryEntry = students.find((entry) => entry.name === student.name);

    return {
      ...student,
      avatar: getInitials(student.name),
      avatarImage: directoryEntry?.avatarImage,
      color: directoryEntry?.avatarColor ?? "#9a5038",
      id: directoryEntry?.id ?? `STU-${student.rank}`,
    };
  });
}
