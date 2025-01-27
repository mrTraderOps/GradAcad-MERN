export interface StudentRow {
    studentId: string;
    studentName: {
      lastName: string;
      firstName: string;
      middleInitial: string;
    };
    prelim?: number;
    midterm?: number;
    final?: number;
  }