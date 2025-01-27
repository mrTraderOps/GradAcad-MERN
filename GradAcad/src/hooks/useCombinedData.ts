import { useState, useEffect } from "react";
import StudentData from "../models/StudentData"; // Adjust the path
import TermGrade from "../models/TermGrade"; // Adjust the path
import { Student } from "../models/types/StudentData"; // Adjust the path
import { Grade } from "../models/types/GradeData"; // Adjust the path

interface CombinedData extends Student, Grade {}

export const useCombinedData = () => {
  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);

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

  // Effect to load and combine data on mount
  useEffect(() => {
    const students: Student[] = [];

    // Flatten the student data
    StudentData.forEach((courseData) => {
      Object.values(courseData).forEach((studentList) => {
        students.push(...studentList);
      });
    });

    // Map and combine student data with their term grades
    const combined = students.map((student) => {
      const termGrade = TermGrade.find(
        (grade) => grade.studentId === student.studentId
      );
      return {
        ...student,
        ...termGrade,
      } as CombinedData;
    });

    setCombinedData(combined);
  }, []);


  return { combinedData, handleInputChange, setCombinedData };
};



