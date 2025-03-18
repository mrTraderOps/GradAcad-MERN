import { useState, useEffect } from "react";
import { SubjectData } from "../models/types/SubjectData";
import { fetchAcadYrSem, fetchSubjectsByRefId, fetchSubjectsbyUsername } from "../services/SubjectService";


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
  }, [loggedUserName]);

  return { subjects, errorMessage, acadYr, sem};
  
};


export const useSubjectsV2 = (refId: string, acadYr?: string, sem?: string) => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!refId) {
      setErrorMessage("Instructor ID is required");
      setLoading(false);
      return;
    }

    setErrorMessage("");
    setLoading(true);

    // Simulate delay before fetching data
    new Promise<void>((resolve) => {
      setTimeout(() => {
        fetchSubjectsByRefId(refId, acadYr || "", sem || "", setSubjects, setErrorMessage);
        resolve(); // Resolve after fetch completes
      }, 1000); // ⏳ Simulate 2-second delay
    }).finally(() => setLoading(false)); // `.finally` executes after the fetch

  }, [refId, acadYr, sem]);

  return { subjects, errorMessage, loading };
};
