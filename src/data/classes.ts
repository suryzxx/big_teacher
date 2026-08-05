import type { ClassRoom, Student } from "../types";
import { studentAvatarImages } from "../assets/mock/students";

const tasks = [
  {
    id: "t-01",
    title: "Read: Why Rivers Bend",
    resourceType: "Reading" as const,
    dueDate: "Jul 25",
  },
  {
    id: "t-02",
    title: "Watch: How Bridges Work",
    resourceType: "Video" as const,
    dueDate: "Jul 27",
  },
  {
    id: "t-03",
    title: "Listen: Weather Report Lab",
    resourceType: "Podcast" as const,
    dueDate: "Jul 28",
  },
];

const classStudentSeeds = [
  ["Mia Chen", 710, 96, 92, "Low"],
  ["Leo Wang", 650, 74, 78, "Medium"],
  ["Amy Zhang", 590, 42, 54, "High"],
  ["Noah Li", 760, 112, 96, "Low"],
  ["Sophie Liu", 830, 88, 86, "Low"],
  ["Ethan Sun", 790, 64, 72, "Medium"],
  ["Grace Hu", 910, 118, 98, "Low"],
  ["Olivia Chen", 740, 82, 84, "Low"],
  ["Henry Zhao", 680, 70, 76, "Medium"],
  ["Emma Lin", 810, 104, 94, "Low"],
  ["Aaliyah Johnson", 930, 108, 90, "Low"],
  ["Ethan Kim", 880, 92, 82, "Low"],
  ["Mia Rodriguez", 810, 76, 74, "Medium"],
  ["Liam Chen", 760, 68, 70, "Low"],
  ["Sophia Patel", 710, 58, 62, "Medium"],
  ["Noah Thompson", 980, 122, 97, "Low"],
  ["Isabella Garcia", 840, 94, 88, "Low"],
  ["James Wilson", 690, 46, 48, "High"],
  ["Olivia Martinez", 900, 106, 91, "Low"],
  ["Benjamin Moore", 770, 66, 73, "Low"],
  ["Chloe Anderson", 860, 98, 89, "Low"],
  ["William Taylor", 650, 44, 50, "High"],
  ["Lucas Brown", 720, 72, 69, "Medium"],
  ["Ava Davis", 800, 86, 81, "Low"],
  ["Daniel Park", 875, 100, 87, "Low"],
] satisfies Array<[string, number, number, number, Student["risk"]]>;

function makeClassStudent([name, readingLevel, weeklyMinutes, completionRate, risk]: (typeof classStudentSeeds)[number], index: number): Student {
  const taskProgress = Math.min(100, Math.max(0, completionRate + ((index % 5) - 2) * 6));
  const secondProgress = Math.min(100, Math.max(0, completionRate - 18 + (index % 4) * 7));

  return {
    id: `s-${String(index + 1).padStart(2, "0")}`,
    name,
    avatarColor: "#ffffff",
    avatarImage: studentAvatarImages[index % studentAvatarImages.length],
    readingLevel,
    weeklyMinutes,
    completionRate,
    risk,
    tasks: [
      {
        ...tasks[0],
        score: risk === "High" ? null : Math.min(98, 72 + (index % 8) * 3),
        progress: taskProgress,
        status: taskProgress >= 100 ? "Completed" : risk === "High" ? "Needs help" : "In progress",
      },
      {
        ...tasks[1],
        score: secondProgress >= 100 ? Math.min(96, 78 + (index % 6) * 3) : null,
        progress: secondProgress,
        status: secondProgress >= 100 ? "Submitted" : "In progress",
      },
      {
        ...tasks[2],
        score: null,
        progress: Math.max(0, completionRate - 52),
        status: completionRate > 70 ? "In progress" : "Not started",
      },
    ],
  };
}

export const classes: ClassRoom[] = [
  {
    id: "c-01",
    name: "G4-Rainbow Class",
    grade: "G4",
    schedule: "Mon / Wed 16:30",
    activeUnit: "Earth Around Us",
    students: classStudentSeeds.map(makeClassStudent),
  },
  {
    id: "c-02",
    name: "G4-Sunshine Class",
    grade: "G4",
    schedule: "Tue / Thu 18:00",
    activeUnit: "Design Thinking",
    students: [
      {
        id: "s-05",
        name: "Sophie Liu",
        avatarColor: "#dc2626",
        readingLevel: 830,
        weeklyMinutes: 88,
        completionRate: 86,
        risk: "Low",
        tasks: [
          { ...tasks[1], score: 91, progress: 100, status: "Completed" },
          { ...tasks[0], score: null, progress: 68, status: "In progress" },
          { ...tasks[2], score: null, progress: 34, status: "In progress" },
        ],
      },
      {
        id: "s-06",
        name: "Ethan Sun",
        avatarColor: "#0891b2",
        readingLevel: 790,
        weeklyMinutes: 64,
        completionRate: 72,
        risk: "Medium",
        tasks: [
          { ...tasks[1], score: null, progress: 82, status: "Submitted" },
          { ...tasks[0], score: null, progress: 50, status: "In progress" },
          { ...tasks[2], score: null, progress: 10, status: "Needs help" },
        ],
      },
      {
        id: "s-07",
        name: "Grace Hu",
        avatarColor: "#16a34a",
        readingLevel: 910,
        weeklyMinutes: 118,
        completionRate: 98,
        risk: "Low",
        tasks: [
          { ...tasks[1], score: 95, progress: 100, status: "Completed" },
          { ...tasks[0], score: 90, progress: 100, status: "Completed" },
          { ...tasks[2], score: null, progress: 76, status: "In progress" },
        ],
      },
    ],
  },
  {
    id: "c-03",
    name: "G4-Moonlight Class",
    grade: "G4",
    schedule: "Wed / Fri 17:00",
    activeUnit: "Reading Adventures",
    students: [
      {
        id: "s-08",
        name: "Olivia Chen",
        avatarColor: "#a855f7",
        avatarImage: studentAvatarImages[10],
        readingLevel: 740,
        weeklyMinutes: 82,
        completionRate: 84,
        risk: "Low",
        tasks: [
          { ...tasks[0], score: 86, progress: 100, status: "Completed" },
          { ...tasks[1], score: null, progress: 62, status: "In progress" },
          { ...tasks[2], score: null, progress: 28, status: "In progress" },
        ],
      },
      {
        id: "s-09",
        name: "Henry Zhao",
        avatarColor: "#f97316",
        avatarImage: studentAvatarImages[15],
        readingLevel: 680,
        weeklyMinutes: 70,
        completionRate: 76,
        risk: "Medium",
        tasks: [
          { ...tasks[0], score: null, progress: 80, status: "Submitted" },
          { ...tasks[1], score: null, progress: 40, status: "In progress" },
          { ...tasks[2], score: null, progress: 12, status: "Needs help" },
        ],
      },
      {
        id: "s-10",
        name: "Emma Lin",
        avatarColor: "#059669",
        avatarImage: studentAvatarImages[18],
        readingLevel: 810,
        weeklyMinutes: 104,
        completionRate: 94,
        risk: "Low",
        tasks: [
          { ...tasks[0], score: 92, progress: 100, status: "Completed" },
          { ...tasks[1], score: 88, progress: 100, status: "Submitted" },
          { ...tasks[2], score: null, progress: 66, status: "In progress" },
        ],
      },
    ],
  },
];
