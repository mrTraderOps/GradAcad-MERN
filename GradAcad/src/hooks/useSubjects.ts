import { useState, useEffect } from "react";
import { SubjectData } from "../models/types/SubjectData";
import { fetchAcadYrSem, fetchSubjectsbyUsername } from "../services/SubjectService";
import API from "../context/axiosInstance";


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


export const useSubjectsV2 = (refId: string, acadYr?: string, sem?: string, options?: { enabled?: boolean }) => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!options?.enabled) {
      setLoading(false);
      return
    };

    if (!refId) {
      setErrorMessage("Instructor ID is required");
      setLoading(false);
      return;
    }

    const fetchSubjectsByRefId = async () => {
      try {
        setErrorMessage("");
        setLoading(true);
  
        const response = await API.post("/subject/getSubjectsByRefId", {
          refId: refId,
          acadYr: acadYr || "",
          sem: sem || "",
        });
  
        if (response.data.success && options?.enabled) {
          setSubjects(response.data.subjects);
        } else {
          setErrorMessage(response.data.message);
        }
      } catch (error) {
        if (error instanceof Error) {
          const message = (error as any).response?.data?.message || "An error occurred.";
          setErrorMessage(message);
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSubjectsByRefId();
  }, [refId, acadYr, sem, options?.enabled]);

  return { subjects, errorMessage, loading };
};

export const useLazyFetchSubject = () => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSubjects = async (refId: string, acadYr: string, sem: string) => {
    setLoading(true);
    setErrorMessage("");

      try {
        const response = await API.post("/subject/getSubjectsByRefId", {
          refId,
          acadYr,
          sem,
        });

        if (response.data.success) {
          setSubjects(response.data.subjects);
        } else {
          setErrorMessage(response.data.message);
        }
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    return { subjects, loading, errorMessage, fetchSubjects };
  } 
