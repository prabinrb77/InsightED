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
  archivedAt?: string;
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
];

export const SCHOOL_STUDENTS: Record<string, Student[]> = {
  harbourview: STUDENTS,
  banksia: [
    { id: "liam-b", short: "Liam B.", full: "Liam Brooks", code: "4021", studentId: "#BAN-4021", grade: "Year 5", guardian: "Grace Brooks (Mother)", attendance: 91, trend: "improving" },
    { id: "zara-k", short: "Zara K.", full: "Zara Khan", code: "4022", studentId: "#BAN-4022", grade: "Year 5", guardian: "Imran Khan (Father)", attendance: 87, trend: "steady" },
    { id: "oscar-t", short: "Oscar T.", full: "Oscar Tan", code: "4023", studentId: "#BAN-4023", grade: "Year 6", guardian: "Mei Tan (Mother)", attendance: 96, trend: "improving" },
  ],
  rivergum: [
    { id: "evie-c", short: "Evie C.", full: "Evie Campbell", code: "4021", studentId: "#RIV-4021", grade: "Year 7", guardian: "Ian Campbell (Father)", attendance: 89, trend: "steady" },
    { id: "aiden-n", short: "Aiden N.", full: "Aiden Nguyen", code: "4022", studentId: "#RIV-4022", grade: "Year 8", guardian: "Linh Nguyen (Mother)", attendance: 93, trend: "improving" },
    { id: "ruby-s", short: "Ruby S.", full: "Ruby Singh", code: "4023", studentId: "#RIV-4023", grade: "Year 7", guardian: "Kiran Singh (Guardian)", attendance: 84, trend: "declining" },
  ],
};

export function findStudent(id: string) {
  return STUDENTS.find((s) => s.id === id);
}
