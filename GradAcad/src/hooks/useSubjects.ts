import { useState, useEffect } from "react";
import { SubjectData } from "../models/types/SubjectData";
import { fetchAcadYrSem, fetchSubjectsbyUsername } from "../services/SubjectService";

export const useSubjects = (loggedUserName: string | undefined) => {

  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sem, setSem] = useState<string>("");
  const [acadYr, setAcadYr] = useState<string>("");

  useEffect(() => {
    if (loggedUserName) {
      setErrorMessage("");

      fetchAcadYrSem(
        setAcadYr, // Set the academic year
        setSem, // Set the semester
        setErrorMessage // Handle errors
      );

     
      fetchSubjectsbyUsername(loggedUserName, setSubjects, setErrorMessage);
    }
  }, [loggedUserName, acadYr, sem]);

  return { subjects, errorMessage, acadYr, sem};
};
