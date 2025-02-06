export interface Student {
    studentId: string;
    StudentId?: string;
    LastName?: string;
    FirstName?: string;
    MiddleInitial?: string;
    studentName: {
      lastName: string;
      firstName: string;
      middleInitial: string;
    };
  }