import { useState, useEffect } from "react";
import { CombinedDataProps, Student } from "../models/types/StudentData"; 
import { GradeData } from "../models/types/GradeData"; 
import { StudentData, StudentGrade } from "../services/StudentService";

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

  const [currentGrades, setCurrentGrades] = useState<Record<string, number>>({});
  const [originalGrades, setOriginalGrades] = useState<Record<string, number>>(
    {}
  );

  const handleInputChange = (
    index: number,
    fieldName: string,
    value: number | undefined
  ) => {

    const studentId = combinedData[index].StudentId;

    setCurrentGrades((prev) => ({
      ...prev,
      [studentId]: value ?? 0,
    }));
  
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

    const combined = students.map((student) => {
      const termGrade = grades.find((grade) => grade.StudentId === student.StudentId);

      return {
        ...student,
        terms: {
          PRELIM: termGrade?.terms?.PRELIM || null,
          MIDTERM: termGrade?.terms?.MIDTERM || null,
          FINAL: termGrade?.terms?.FINAL || null,
        },
      } as CombinedDataProps;
    });
    setCombinedData(combined);

    setLoading(false);
  }, [students, grades]);

  return { 
    handleInputChange, 
    setCombinedData, 
    setCurrentGrades, 
    setOriginalGrades, 
    combinedData, 
    errorMessage, 
    loading, 
    students, 
    currentGrades, 
    originalGrades,
    grades 
  };
};