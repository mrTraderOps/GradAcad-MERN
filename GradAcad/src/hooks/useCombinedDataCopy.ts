import { useState, useEffect } from "react";
import { Student } from "../models/types/StudentData"; // Adjust the path
import { Grade } from "../models/types/GradeData"; // Adjust the path
import { StudentData } from "../services/StudentService";
import TermGrade from "../models/TermGrade"; // Adjust the path

interface CombinedData extends Student, Grade {}

export const useCombinedData = (department: string, section: string) => {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Function to handle input changes
  const handleInputChange = (
    index: number,
    fieldName: keyof CombinedData,
    value: any
  ) => {
    setCombinedData((prevData) =>
      prevData.map((row, i) =>
        i === index ? { ...row, [fieldName]: value } : row
      )
    );
  };

  // Fetch student data on mount or when department/section changes
  useEffect(() => {
    setLoading(true);

    StudentData(department, section, (students: Student[]) => {
      // Combine student data with term grades
      const combined = students.map((student) => {
        const termGrade = TermGrade.find(
          (grade) => grade.studentId === student.StudentId
        );
        return {
          ...student,
          ...termGrade,
        } as CombinedData;
      });

      setCombinedData(combined);
      setLoading(false);
    }, (error: string) => {
      setErrorMessage(error);
      setLoading(false);
    });

  }, [department, section]);

  return { combinedData, handleInputChange, setCombinedData, errorMessage, loading };
};
