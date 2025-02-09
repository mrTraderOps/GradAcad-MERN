export interface Grade {
    studentId: string;
    prelim?: number;
    midterm?: number;
    final?: number;
  }

  export interface Term {
    prelim: boolean;
    midterm: boolean;
    final: boolean;
  }
  
  export interface TermData {
    term: Term[];
  }