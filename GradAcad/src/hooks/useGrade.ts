import { useState, useEffect } from "react";
import { GenerateReportService } from "../services/GradeService";

interface DetailProps {
  acadYr: string,
  sem: string,
  details: {
    dept: string;
    subjectCode: string;
    subjectName: string;
    section: string;
  }[];
}

export const useGrade = (loggedUserName: string) => {
  const [data, setData] = useState<DetailProps[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (loggedUserName) {
      setErrorMessage("");
      setLoading(true);

      // Call GenerateReportService with all parameters
      GenerateReportService(
        loggedUserName,
        setData,
        setErrorMessage, // Update errorMessage on error
        setLoading, // Update loading state
      );
    }
  }, [loggedUserName]);

  return { data, errorMessage, loading };
};