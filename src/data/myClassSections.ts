import type { MyClassSummaryCardData } from "@/types";

export type MyClassSection = "students" | "assigned" | "lexile";

export const myClassSections: Array<MyClassSummaryCardData<MyClassSection>> = [
  {
    key: "students",
    title: "Roster",
    primary: "25 students",
    secondary: "",
    detail: "",
    iconImage: `${import.meta.env.BASE_URL}myclass-icons/students.png`,
    tone: "green",
  },
  {
    key: "assigned",
    title: "Tasks",
    primary: "27 active",
    secondary: "64 total this month",
    detail: "",
    iconImage: `${import.meta.env.BASE_URL}myclass-icons/assigned-tasks.png`,
    tone: "amber",
  },
  {
    key: "lexile",
    title: "Report",
    primary: "820L",
    secondary: "Avg. Lexile",
    detail: "Avg. AR 4.2",
    iconImage: `${import.meta.env.BASE_URL}myclass-icons/lexile-ar.png`,
    tone: "blue",
  },
];
