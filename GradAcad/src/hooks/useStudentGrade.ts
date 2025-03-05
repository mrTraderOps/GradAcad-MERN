import { useEffect, useState } from "react";
import { GradeData } from "../models/types/GradeData";
import { StudentGrade } from "../services/StudentService";

interface UseStudentGradeProps {
  dept: string;
  sect: string;
  subjCode: string;
  terms: string[];
  term?: string;
}

export const useStudentGrade = ({ dept, sect, subjCode, terms }: UseStudentGradeProps) => {

  const [grades, setGrades] = useState<GradeData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dept || !sect || !subjCode || terms.length === 0) {
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
      setError,
      setLoading
    );

  }, [dept, sect, subjCode, terms]);

  return { grades, error, loading };
};


