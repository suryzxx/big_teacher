import { useState } from "react";
import { StudentReportLineChart } from "./LexileCharts";
import type {
  ReportTimeRange,
  ReportTrendPoint,
  StudentDetailStudent,
  StudentReadingReportData,
} from "@/types";

export type { ReportTimeRange, StudentReadingReportData } from "@/types";

export type ReportDimension = "academic" | "reading" | "writing";

export type ReportOption<T extends string> = {
  key: T;
  label: string;
  detail?: string;
};

export function StudentReportPanel({
  student,
  timeRange,
  timeRangeOptions,
  dimensionOptions,
  getStudentReportData,
  getReportClassAverageData,
  getArTrendFromLexile,
}: {
  student: StudentDetailStudent;
  timeRange: ReportTimeRange;
  timeRangeOptions: Array<ReportOption<ReportTimeRange>>;
  dimensionOptions: Array<ReportOption<ReportDimension>>;
  getStudentReportData: (student: StudentDetailStudent, timeRange: ReportTimeRange) => StudentReadingReportData;
  getReportClassAverageData: (timeRange: ReportTimeRange) => StudentReadingReportData;
  getArTrendFromLexile: (data: ReportTrendPoint[], finalAr?: number) => ReportTrendPoint[];
}) {
  const [activeTimeRange, setActiveTimeRange] = useState<ReportTimeRange>(timeRange);
  const [activeDimension, setActiveDimension] = useState<ReportDimension>("academic");
  const [rangeAnchor, setRangeAnchor] = useState({ timeRange, studentId: student.id });
  if (rangeAnchor.timeRange !== timeRange || rangeAnchor.studentId !== student.id) {
    setRangeAnchor({ timeRange, studentId: student.id });
    setActiveTimeRange(timeRange);
  }
  const activeData = getStudentReportData(student, activeTimeRange);
  const classAverageData = getReportClassAverageData(activeTimeRange);
  const studentArData = getArTrendFromLexile(activeData.lexile, student.ar);
  const classAverageArData = getArTrendFromLexile(classAverageData.lexile);
  const chartGroups: Record<
    ReportDimension,
    Array<{
      key: string;
      label: string;
      unit: string;
      data: ReportTrendPoint[];
      classAverageData: ReportTrendPoint[];
    }>
  > = {
    academic: [
      { key: "lexile", label: "Lexile", unit: "L", data: activeData.lexile, classAverageData: classAverageData.lexile },
      { key: "ar", label: "AR", unit: "ATOS", data: studentArData, classAverageData: classAverageArData },
    ],
    reading: [
      { key: "reading-time", label: "Reading Time", unit: "min", data: activeData.readingTime, classAverageData: classAverageData.readingTime },
      { key: "reading-words", label: "Reading Words", unit: "words", data: activeData.readingWords, classAverageData: classAverageData.readingWords },
    ],
    writing: [
      { key: "writing-time", label: "Writing Time", unit: "min", data: activeData.writingTime, classAverageData: classAverageData.writingTime },
      { key: "writing-words", label: "Writing Words", unit: "words", data: activeData.writingWords, classAverageData: classAverageData.writingWords },
    ],
  };

  return (
    <div className="student-report-panel">
      <section className="student-report-chart-area" aria-label={`${student.name} report charts`}>
        <div className="student-report-chart-toolbar">
          <div className="student-report-range" role="tablist" aria-label="Report time range">
            {timeRangeOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={activeTimeRange === option.key}
                onClick={() => setActiveTimeRange(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="report-dimension-tabs" role="tablist" aria-label="Report dimension">
            {dimensionOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={activeDimension === option.key}
                onClick={() => setActiveDimension(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="student-report-chart-grid">
          {chartGroups[activeDimension].map((chart) => (
            <StudentReportLineChart
              key={chart.key}
              label={chart.label}
              unit={chart.unit}
              data={chart.data}
              classAverageData={chart.classAverageData}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
