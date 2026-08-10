import { SCHOOL_STUDENTS, STUDENTS, type Student } from "../data/students";
import { getDemoSession } from "./demoAccounts";

export type BehaviourLog = {
  id: string;
  studentId: string;
  behaviour: string;
  intensity: "Low" | "Medium" | "High";
  context: string;
  notes: string;
  createdAt: string;
};

const STUDENTS_KEY = "insighted.educator.students";
const LOGS_KEY = "insighted.educator.behaviourLogs";

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getStudents(): Student[] {
  const schoolId = getDemoSession()?.school?.id ?? "harbourview";
  return read<Student[]>(`${STUDENTS_KEY}.${schoolId}`, SCHOOL_STUDENTS[schoolId] ?? STUDENTS)
    .filter((student) => !student.archivedAt);
}

export function addStudent(input: {
  first: string;
  last: string;
  grade?: string;
  guardian?: string;
}): Student {
  const students = getStudents();
  const idBase = `${input.first}-${input.last}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const code = String(4021 + students.length);
  const student: Student = {
    id: `${idBase}-${Date.now().toString(36)}`,
    short: `${input.first} ${input.last.charAt(0)}.`,
    full: `${input.first} ${input.last}`,
    code,
    studentId: `#STU-${8821 + students.length}`,
    grade: input.grade || "Grade 4",
    guardian: input.guardian || "Not provided",
    attendance: 100,
    trend: "steady",
  };
  const schoolId = getDemoSession()?.school?.id ?? "harbourview";
  localStorage.setItem(`${STUDENTS_KEY}.${schoolId}`, JSON.stringify([...students, student]));
  return student;
}

export function archiveStudent(id: string) {
  const schoolId = getDemoSession()?.school?.id ?? "harbourview";
  const students = read<Student[]>(`${STUDENTS_KEY}.${schoolId}`, SCHOOL_STUDENTS[schoolId] ?? STUDENTS);
  localStorage.setItem(`${STUDENTS_KEY}.${schoolId}`, JSON.stringify(students.map((student) =>
    student.id === id ? { ...student, archivedAt: new Date().toISOString() } : student)));
}

export function getBehaviourLogs(): BehaviourLog[] {
  return read<BehaviourLog[]>(LOGS_KEY, []);
}

export function addBehaviourLog(
  log: Omit<BehaviourLog, "id" | "createdAt">,
): BehaviourLog {
  const saved: BehaviourLog = {
    ...log,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(
    LOGS_KEY,
    JSON.stringify([saved, ...getBehaviourLogs()]),
  );
  return saved;
}

export function downloadStudentsCsv(students = getStudents()) {
  const quote = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  const rows = [
    ["Student", "Student ID", "Grade", "Primary Guardian", "Attendance"],
    ...students.map((student) => [
      student.full,
      student.studentId,
      student.grade,
      student.guardian,
      `${student.attendance}%`,
    ]),
  ];
  const csv = rows.map((row) => row.map(quote).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "insighted-students.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
