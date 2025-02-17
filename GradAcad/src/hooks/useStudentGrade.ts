import { useEffect, useState } from "react";
import axios from "axios";
import { GradeData } from "../models/types/GradeData";

interface UseStudentGradeProps {
  dept: string;
  sect: string;
  subjCode: string;
  terms: string[]; // Array of selected terms (e.g., ["PRELIM", "MIDTERM"])
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
    axios
      .post("http://localhost:5000/api/v1/grade/getAllGrades", {
        department: dept,
        section: sect,
        subjectCode: subjCode,
        terms: terms, // Ensure `terms` is sent as an array
      })
      .then((response) => {
        if (response.data.success && Array.isArray(response.data.data)) {
          setGrades(response.data.data);
          setError("");
        } else {
          setError("Failed to fetch grades.");
        }
      })
      .catch((error) => {
        setError("An error occurred while fetching grades.");
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dept, sect, subjCode, terms]); // Include dependencies for re-fetching

  return { grades, error, loading };
};
