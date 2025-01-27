import { useState, useEffect } from "react";
import StudentData from "../models/StudentData";
import { StudentRow } from "../models/types/StudentRow";

export const useStudentList = (LoggeduserName: string | undefined) => {
  const [studentList, setStudentList] = useState<StudentRow[]>([]);

  // Mapping of usernames to designations
  const userMapping: Record<string, string> = {
    jonathan_pascual: "BEED",
    christian_torres: "BSCS",
    oliver_palad: "BSHM",
  };

  // Function to retrieve the student list by username
  function getStudentListByUsername(username: string): StudentRow[] {
    if (username in userMapping) {
      const designation = userMapping[username as keyof typeof userMapping];

      const courseData = StudentData.find((data) =>
        designation in data ? true : false
      );

      return courseData?.[designation as keyof typeof courseData] ?? [];
    }
    return [];
  }

  // Effect to fetch and set the student list
  useEffect(() => {
    const username = LoggeduserName ?? "";
    const list = getStudentListByUsername(username);
    setStudentList(list);
  }, [LoggeduserName]);

  return studentList; 
};
