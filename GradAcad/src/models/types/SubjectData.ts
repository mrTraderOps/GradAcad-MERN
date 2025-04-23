export interface SubjectData {
  dept: string;
  subjectCode: string;
  subjectName: string;
  course?: string;
  section: string;
  terms?: [string];
  acadYr: string;
  sem: string;
  enrolledStudents?: string;
}
