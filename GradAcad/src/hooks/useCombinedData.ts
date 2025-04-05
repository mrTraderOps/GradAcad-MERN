import { useState, useEffect } from "react";
import { CombinedDataProps, Student } from "../models/types/StudentData"; 
import { GradeData } from "../models/types/GradeData"; 
import { StudentData, StudentGrade } from "../services/StudentService";
import  API  from "../context/axiosInstance";

interface Props {
  dept: string;
  sect: string;
  subjCode: string;
  sem?: string;
  acadYr?: string;
  terms?: string[];
}

export const useCombinedData = ({ dept, sect, subjCode, terms, sem, acadYr }: Props) => {
  const [combinedData, setCombinedData] = useState<CombinedDataProps[]>([]);
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [errorMessage, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentGrades, setCurrentGrades] = useState<Record<string, number>>({});
  const [originalGrades, setOriginalGrades] = useState<Record<string, number>>(
    {}
  );

  const handleInputChange = (
    index: number,
    fieldName: string,
    value: number | undefined
  ) => {

    const studentId = combinedData[index].StudentId;

    setCurrentGrades((prev) => ({
      ...prev,
      [studentId]: value ?? 0,
    }));
  
    setCombinedData((prevData) =>
      prevData.map((row, i) =>
        i === index
          ? {
              ...row,
              terms: {
                ...row.terms,
                [fieldName]: value,
              },
            }
          : row
      )
    );
  };
  

  useEffect(() => {
    if (!dept || !acadYr || !sem || !sect || !subjCode || !terms || terms.length === 0) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    setLoading(true);

    StudentGrade(
      dept,
      acadYr,
      sem,
      sect,
      subjCode,
      terms,
      setGrades,
      (error: string) => {
        setError(error);
        setLoading(false);
      },
    );

    StudentData(
      dept,
      sect,
      (students: Student[]) => {
        setStudents(students);
      },
      (error: string) => {
        setError(error);
        setLoading(false);
      }
    );
  }, [dept, sect, subjCode, terms]);

  useEffect(() => {
    if (students.length === 0 || grades.length === 0) return;

    const combined = students.map((student) => {
      const termGrade = grades.find((grade) => grade.StudentId === student.StudentId);

      return {
        ...student,
        terms: {
          PRELIM: termGrade?.terms?.PRELIM || null,
          MIDTERM: termGrade?.terms?.MIDTERM || null,
          FINAL: termGrade?.terms?.FINAL || null,
        },
      } as CombinedDataProps;
    });
    setCombinedData(combined);

    setLoading(false);
  }, [students, grades]);

  return { 
    handleInputChange, 
    setCombinedData, 
    setCurrentGrades, 
    setOriginalGrades, 
    combinedData, 
    errorMessage, 
    loading, 
    students, 
    currentGrades, 
    originalGrades,
    grades 
  };
};

export const useCombinedDatav2 = ({ acadYr, sem, subjCode, terms, sect, dept }: Props) => {
  const [combinedData, setCombinedData] = useState<CombinedDataProps[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [errorMessage, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentGrades, setCurrentGrades] = useState<Record<string, number>>({});
  const [originalGrades, setOriginalGrades] = useState<Record<string, number>>({});

  // Handle Input Change
  const handleInputChange = (index: number, fieldName: string, value: number | undefined) => {
    const studentId = combinedData[index].StudentId;

    setCurrentGrades((prev) => ({
      ...prev,
      [studentId]: value ?? 0,
    }));

    setCombinedData((prevData) =>
      prevData.map((row, i) =>
        i === index
          ? {
              ...row,
              terms: {
                ...row.terms,
                [fieldName]: value,
              },
            }
          : row
      )
    );
  };

  // ✅ Reset error before making request
  

  useEffect(() => {

  setError(null);
  setLoading(true);

    if (!acadYr || !sem || !subjCode || !terms || terms.length === 0) {
      setError("Missing required parameters 12123");
      setLoading(false);
      return;
    }

    API
      .post("/grade/getStudentGrades", {
        acadYr,
        sem,
        dept,
        sect,
        subjectId: subjCode,
        selectedTerms: terms,
      })
      .then((response) => {
        if (response.data.success) {
          setCombinedData(response.data.data);

           // Extract student details from response and map it to Student interface
           const studentList: Student[] = response.data.data.map((student: CombinedDataProps) => ({
            StudentId: student.StudentId,
            LastName: student.LastName,
            FirstName: student.FirstName,
            MiddleInitial: student.MiddleInitial,
          }));

          setStudents(studentList);
        } else {
          setError(response.data.message || "Failed to fetch student grades.");
        }
      })
      .catch((error) => {
        console.error("Error fetching student grades:", error);
        setError("An error occurred while fetching student grades.");
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false); // Hide loading after delay
        }, 1000);        
      });
  }, [acadYr, sem, subjCode, terms]);

  return {
    handleInputChange,
    setCombinedData,
    setCurrentGrades,
    setOriginalGrades,
    setLoading,
    combinedData,
    students,
    errorMessage,
    loading,
    currentGrades,
    originalGrades,
  };
};

export const useCombinedDatav2ForExport = ({ acadYr, sem, subjCode, terms, dept, sect }: Props) => {
  const [combinedDataForXport, setCombinedDataForXport] = useState<CombinedDataProps[]>([]);
  const [errorMessageXport, setErrorXport] = useState<string | null>(null);
  const [loadingXport, setLoadingXport] = useState<boolean>(true);

  // Determine newTerms based on conditions
  let newTerms: string[] = [];

  if (terms?.includes("PRELIM")) {
    newTerms = ["PRELIM"];
  }
  if (terms?.includes("MIDTERM")) {
    newTerms = ["PRELIM", "MIDTERM"];
  }
  if (terms?.includes("FINAL")) {
    newTerms = [];
  }

  useEffect(() => {
    if (!acadYr || !sem || !subjCode || !terms?.length) {
      setErrorXport("Missing required parameters");
      setLoadingXport(false);
      return;
    }

    setLoadingXport(true);

    API
      .post("/grade/getStudentGrades", {
        acadYr,
        sem,
        dept,
        sect,
        subjectId: subjCode,
        selectedTerms: newTerms, // Use the dynamically computed newTerms
      })
      .then((response) => {
        if (response.data.success) {
          setCombinedDataForXport(response.data.data);
        } else {
          setErrorXport(response.data.message || "Failed to fetch student grades.");
        }
      })
      .catch((error) => {
        console.error("Error fetching student grades:", error);
        setErrorXport("An error occurred while fetching student grades.");
      })
      .finally(() => {
        setTimeout(() => {
          setLoadingXport(false); // Hide loading after delay
        }, 1000);
      });
  }, [acadYr, sem, subjCode, terms]);

  return {
    combinedDataForXport,
    errorMessageXport,
    loadingXport,
    setLoadingXport
  };
};

