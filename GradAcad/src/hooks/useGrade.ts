import { useState, useEffect } from "react";
import { GenerateReportService } from "../services/GradeService";

export interface DetailProps {
  acadYr: string,
  sem: string,
  subjectId: string,
  subjectName: string
  dept: string,
  sect: string
}

export const useGrade = (refId: string) => {
  const [data, setData] = useState<DetailProps[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (refId) {
      setErrorMessage("");
      setLoading(true);

      // Call GenerateReportService with all parameters
      GenerateReportService(
        refId,
        setData,
        setErrorMessage, // Update errorMessage on error
        setLoading, // Update loading state
      );
    }
  }, [refId]);

  return { data, errorMessage, loading };
};