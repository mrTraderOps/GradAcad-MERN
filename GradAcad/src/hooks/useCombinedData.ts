import { useState, useEffect } from "react";
import { Student } from "../models/types/StudentData"; 
import { GradeData } from "../models/types/GradeData"; 
import { StudentData, StudentGrade } from "../services/StudentService";

interface CombinedDataProps {
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

interface Props {
  dept: string;
  sect: string;
  subjCode: string;
  terms?: string[];
}

export const useCombinedData = ({ dept, sect, subjCode, terms }: Props) => {
  const [combinedData, setCombinedData] = useState<CombinedDataProps[]>([]);
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [errorMessage, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const handleInputChange = (
    index: number,
    fieldName: string,
    value: number | undefined
  ) => {
    setCombinedData((prevData) =>
      prevData.map((row, i) =>
        i === index
          ? {
              ...row,
              terms: {
                ...row.terms, 
                [fieldName]: value,
              },
            }
          : row
      )
    );
  };
  

  useEffect(() => {
    if (!dept || !sect || !subjCode || !terms || terms.length === 0) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch grades
    StudentGrade(
      dept,
      sect,
      subjCode,
      terms,
      setGrades,
      (error: string) => {
        setError(error);
        setLoading(false);
      },
      () => {}
    );

    // Fetch student data
    StudentData(
      dept,
      sect,
      (students: Student[]) => {
        setStudents(students);
      },
      (error: string) => {
        setError(error);
        setLoading(false);
      }
    );
  }, [dept, sect, subjCode, terms]);

  useEffect(() => {
    if (students.length === 0 || grades.length === 0) return;

    // Combine student data with grades
    const combined = students.map((student) => {
      const termGrade = grades.find((grade) => grade.StudentId === student.StudentId);

      return {
        ...student,
        terms: {
          PRELIM: termGrade?.terms?.PRELIM|| null,
          MIDTERM: termGrade?.terms?.MIDTERM || null,
          FINAL: termGrade?.terms?.FINAL || null,
        },
      } as CombinedDataProps;
    });

    setCombinedData(combined);
    setLoading(false);
  }, [students, grades]);

  return { combinedData, handleInputChange, setCombinedData, errorMessage, loading, students};
};