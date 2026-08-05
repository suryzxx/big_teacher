import type { ReportTimeRange } from "@/types";
import type { ReportOption } from "./StudentReportPanel";

export type ReportDimension = "academic" | "reading" | "writing";

export const reportTimeRangeOptions: Array<ReportOption<ReportTimeRange>> = [
  { key: "week", label: "Week", detail: "Last 7 days" },
  { key: "month", label: "Month", detail: "Last 30 days" },
  { key: "semester", label: "Semester", detail: "Jan-Jun" },
];

export const reportDimensionOptions: Array<ReportOption<ReportDimension>> = [
  { key: "academic", label: "Academic" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
];
