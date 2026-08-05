import { studentAvatarImages } from "../assets/mock/students";
import type { StudentDirectoryEntry, StudentDirectoryStatus } from "../types";

const studentDirectorySeeds = [
  ["Aaliyah Johnson", 930, 5.1, "ok"],
  ["Ethan Kim", 880, 4.7, "ok"],
  ["Mia Rodriguez", 810, 4.2, "watch"],
  ["Liam Chen", 760, 3.6, "ok"],
  ["Sophia Patel", 710, 3.2, "ok"],
  ["Noah Thompson", 980, 5.6, "watch"],
  ["Isabella Garcia", 840, 4.5, "ok"],
  ["James Wilson", 690, 3.1, "support"],
  ["Olivia Martinez", 900, 4.9, "ok"],
  ["Benjamin Moore", 770, 3.8, "ok"],
  ["Chloe Anderson", 860, 4.6, "ok"],
  ["William Taylor", 650, 2.9, "support"],
  ["Lucas Brown", 720, 3.4, "watch"],
  ["Ava Davis", 800, 4.1, "ok"],
  ["Daniel Park", 875, 4.8, "ok"],
  ["Emily Nguyen", 735, 3.5, "ok"],
  ["Mason Lee", 915, 5.0, "ok"],
  ["Harper Chen", 795, 4.0, "watch"],
  ["Jackson Wu", 685, 3.0, "support"],
  ["Ella Kim", 850, 4.4, "ok"],
  ["Logan Smith", 740, 3.7, "ok"],
  ["Amelia Wang", 890, 4.9, "ok"],
  ["Jayden Zhao", 705, 3.3, "watch"],
  ["Lily Zhou", 825, 4.3, "ok"],
  ["Ryan Lin", 780, 3.9, "ok"],
] satisfies Array<[string, number, number, StudentDirectoryStatus]>;

export const studentDirectory: StudentDirectoryEntry[] = studentDirectorySeeds.map(
  ([name, lexile, ar, status], index) => ({
    id: `STU-${String(10031 + index).padStart(5, "0")}`,
    name,
    className: "G4-Rainbow Class",
    avatarColor: "#ffffff",
    avatarImage: studentAvatarImages[index % studentAvatarImages.length],
    lexile,
    ar,
    zpd: "",
    activeTasks: index % 4,
    lastActive: index % 5 === 0 ? "30m ago" : `${(index % 6) + 1}h ago`,
    status,
  }),
);
