import { useState, useEffect } from "react";
import { SubjectData } from "../models/types/SubjectData";
import { fetchSubjectsbyUsername } from "../services/SubjectService";

export const useSubjects = (loggedUserName: string | undefined) => {

  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (loggedUserName) {
      setErrorMessage("");
      fetchSubjectsbyUsername(loggedUserName, setSubjects, setErrorMessage);
    }
  }, [loggedUserName]);

  return { subjects, errorMessage };
};
