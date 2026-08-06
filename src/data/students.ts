/** Sample roster backing the educator app screens, taken from the Figma frames. */

export type Student = {
  id: string;
  short: string;
  full: string;
  code: string;
  studentId: string;
  grade: string;
  guardian: string;
  attendance: number;
  trend: "steady" | "improving" | "declining";
};

export const STUDENTS: Student[] = [
  {
    id: "ethan-m",
    short: "Ethan M.",
    full: "Ethan Miller",
    code: "4021",
    studentId: "#STU-8821",
    grade: "Grade 4",
    guardian: "Emily Lewis (Mother)",
    attendance: 72,
    trend: "steady",
  },
  {
    id: "maya-r",
    short: "Maya R.",
    full: "Maya Reid",
    code: "4022",
    studentId: "#STU-8822",
    grade: "Grade 4",
    guardian: "Priya Reid (Mother)",
    attendance: 94,
    trend: "improving",
  },
  {
    id: "julian-p",
    short: "Julian P.",
    full: "Julian Park",
    code: "4023",
    studentId: "#STU-8823",
    grade: "Grade 4",
    guardian: "Daniel Park (Father)",
    attendance: 81,
    trend: "declining",
  },
  {
    id: "sofia-l",
    short: "Sofia L.",
    full: "Sofia Lopez",
    code: "4024",
    studentId: "#STU-8824",
    grade: "Grade 4",
    guardian: "Ana Lopez (Mother)",
    attendance: 88,
    trend: "steady",
  },
  {
    id: "leo-m",
    short: "Leo M.",
    full: "Leo Marsh",
    code: "4025",
    studentId: "#STU-8825",
    grade: "Grade 4",
    guardian: "Emily Lewis (Mother)",
    attendance: 72,
    trend: "declining",
  },
  {
    id: "olivia-w",
    short: "Olivia W.",
    full: "Olivia White",
    code: "4026",
    studentId: "#STU-8826",
    grade: "Grade 4",
    guardian: "Robert White (Father)",
    attendance: 94,
    trend: "improving",
  },
  {
    id: "tahmid-w",
    short: "Tahmid W.",
    full: "Tahmid White",
    code: "4026",
    studentId: "#STU-8826",
    grade: "Grade 4",
    guardian: "Robert White (Father)",
    attendance: 98,
    trend: "improving",
  },
];

export function findStudent(id: string) {
  return STUDENTS.find((s) => s.id === id);
}
