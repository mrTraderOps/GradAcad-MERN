export interface Student {
    studentId: string;
    StudentId?: string;
    LastName?: string;
    FirstName?: string;
    MiddleInitial?: string;
    studentName?: {
      lastName?: string;
      firstName?: string;
      middleInitial?: string;
    };
  }

export interface CombinedDataProps {
    StudentId: string;
    LastName?: string;
    FirstName?: string;
    MiddleInitial?: string;
    terms: {
      PRELIM?: number;
      MIDTERM?: number;
      FINAL?: number;
    };
  }

export interface DataProps {
    dept: string;
    section: string;
    subjectCode: string;
    subjectName: string;
    term: string[];
    acadYr?: string;
    sem?: string;
  }