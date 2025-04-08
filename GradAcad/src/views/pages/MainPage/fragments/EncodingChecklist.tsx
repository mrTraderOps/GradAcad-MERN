import styles from "../styles/GradingPeriod.module.scss";
import style from "../fragments/students_panel/styles/StudentsPanel.module.scss";
import { useTerm } from "../../../../hooks/useTerm";
import { useContext, useEffect, useState } from "react";
import API from "../../../../context/axiosInstance";
import { UserContext } from "../../../../context/UserContext";

interface InstructorData {
  professorName: string;
  profId: string;
  subject: string; // The subject could be a string or an array (if multiple subjects)
}

interface TableRowData {
  profId: string;
  professorName: string;
  subjects: string; // Concatenated subjects (completed + missing)
  status: string; // "Done" or "Missed"
}

const EncodingChecklist = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("User role can't read");
  }

  const { user } = context;

  // Determine the department(s) based on the user role
  let dept: string | string[] = "";
  if (user?.assignDept === "CCS") {
    dept = "BSCS";
  } else if (user?.assignDept === "CHM") {
    dept = "BSHM";
  } else if (user?.assignDept === "COED") {
    dept = ["BSED", "BEED"]; // Handle multiple departments for COED
  }

  const { activeTerms, initialTerm, initialAcadYr, activeSems, initialSem } =
    useTerm();

  const [selectedAcadYr, setSelectedAcadYr] = useState<string>(initialAcadYr);
  const [selectedSem, setSelectedSem] = useState<string>(initialSem);
  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm);
  const [missingData, setMissingData] = useState<InstructorData[]>([]);
  const [completedData, setCompletedData] = useState<InstructorData[]>([]);
  const [disableTerm, setDisableTerm] = useState<boolean>(false);
  const [isDoneInitial, setIsDoneInitial] = useState<boolean>(false);

  // 1. Initialization
  useEffect(() => {
    setSelectedAcadYr(initialAcadYr);
    setSelectedSem(initialSem);
    setSelectedTerm(initialTerm);
    setIsDoneInitial(true);
  }, [initialAcadYr, initialSem, initialTerm]);

  // 2. Watch only the flag (fetch only after init is done)
  useEffect(() => {
    if (isDoneInitial) {
      fetchMissingEnrollmentByDept();
      fetchCompletedEnrollmentByDept();
    }
  }, [isDoneInitial]);

  // 3. Watch future changes AFTER init
  useEffect(() => {
    if (isDoneInitial) {
      fetchMissingEnrollmentByDept();
      fetchCompletedEnrollmentByDept();
    }
  }, [selectedAcadYr, selectedSem, selectedTerm]);

  const fetchMissingEnrollmentByDept = async () => {
    try {
      let response;

      if (Array.isArray(dept)) {
        // Fetch data for BSED first
        response = await API.post("/grade/fetchMissingEnrollmentByDept", {
          acadYr: selectedAcadYr,
          dept: dept[0], // BSED
          sem: selectedSem,
          terms: selectedTerm === "" ? "" : selectedTerm,
        });

        // Fetch data for BEED after BSED is done
        response = await API.post("/grade/fetchMissingEnrollmentByDept", {
          acadYr: selectedAcadYr,
          dept: dept[1], // BEED
          sem: selectedSem,
          terms: selectedTerm === "" ? "" : selectedTerm,
        });

        setMissingData(response.data.data);
      } else {
        // Fetch for a single department (CCS, CHM, etc.)
        response = await API.post("/grade/fetchMissingEnrollmentByDept", {
          acadYr: selectedAcadYr,
          dept: dept, // Single department
          sem: selectedSem,
          terms: selectedTerm === "" ? "" : selectedTerm,
        });
        setMissingData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
    }
  };

  const fetchCompletedEnrollmentByDept = async () => {
    try {
      if (Array.isArray(dept)) {
        // Fetch data for BSED first
        let response = await API.post("/grade/fetchCompletedEnrollmentByDept", {
          acadYr: selectedAcadYr,
          dept: dept[0], // BSED
          sem: selectedSem,
          terms: selectedTerm === "" ? "" : selectedTerm,
        });

        // Fetch data for BEED after BSED is done
        response = await API.post("/grade/fetchCompletedEnrollmentByDept", {
          acadYr: selectedAcadYr,
          dept: dept[1], // BEED
          sem: selectedSem,
          terms: selectedTerm === "" ? "" : selectedTerm,
        });

        setCompletedData(response.data.data);

        // Combine the results from both requests
        // You can combine results here depending on your use case
        // e.g., set the combined data to a state
      } else {
        // Fetch for a single department (CCS, CHM, etc.)
        const response = await API.post(
          "/grade/fetchCompletedEnrollmentByDept",
          {
            acadYr: selectedAcadYr,
            dept: dept, // Single department
            sem: selectedSem,
            terms: selectedTerm === "" ? "" : selectedTerm,
          }
        );
        setCompletedData(response.data.data);
        // Do something with the response data (e.g., set state)
      }
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
    }
  };

  const generateAcadYears = (start: string, end: string): string[] => {
    const startYear = parseInt(start.split(" - ")[0]);
    const endYear = parseInt(end.split(" - ")[0]);

    const years: string[] = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(`${year} - ${year + 1}`);
    }

    return years;
  };

  const academicYearOptions = generateAcadYears(
    "2023 - 2024",
    initialAcadYr
  ).reverse();

  const handleAcadYrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue !== initialAcadYr) {
      setSelectedTerm("");
      setDisableTerm(true);
      setSelectedAcadYr(selectedValue);
    } else {
      setSelectedAcadYr(selectedValue);
      setDisableTerm(false);
      setSelectedTerm(initialTerm);
      setSelectedSem(initialSem);
    }
  };

  const handleSemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue !== initialSem || selectedAcadYr !== initialAcadYr) {
      setSelectedTerm("");
      setDisableTerm(true);
      setSelectedSem(selectedValue);
    } else {
      setSelectedSem(selectedValue);
      setDisableTerm(false);
      setSelectedTerm(initialTerm);
    }
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTerm(e.target.value);
  };

  const mergeInstructorData = (
    completed: InstructorData[],
    missing: InstructorData[]
  ): TableRowData[] => {
    // Ensure that missing is an array
    if (!Array.isArray(missing)) {
      console.error("Missing data is not an array");
      return []; // Return an empty array to avoid further issues
    }

    // Process missing data and ensure concatenation of subjects
    const missingSubjectsMap: { [profId: string]: string[] } = {};

    missing.forEach((data) => {
      if (!missingSubjectsMap[data.profId]) {
        missingSubjectsMap[data.profId] = [];
      }
      missingSubjectsMap[data.profId].push(data.subject);
    });

    // Combine completed and missing data
    const combinedData: TableRowData[] = completed.map(
      (completedInstructor) => {
        const missingSubjects = missingSubjectsMap[completedInstructor.profId];

        // Remove matched data from completed
        if (missingSubjects) {
          missingSubjectsMap[completedInstructor.profId] =
            missingSubjects.filter(
              (subject) =>
                `${completedInstructor.profId}-${subject}` !==
                `${completedInstructor.profId}-${completedInstructor.subject}`
            );
        }

        return {
          profId: completedInstructor.profId,
          professorName: completedInstructor.professorName,
          subjects: completedInstructor.subject,
          status: "Done",
        };
      }
    );

    // Add missing data
    Object.keys(missingSubjectsMap).forEach((profId) => {
      const missingSubjects = missingSubjectsMap[profId];
      if (missingSubjects.length > 0) {
        combinedData.push({
          profId,
          professorName:
            missing.find((instructor) => instructor.profId === profId)
              ?.professorName || "Unknown",
          subjects: missingSubjects.join(", "),
          status: "Missed",
        });
      }
    });

    return combinedData;
  };

  const renderTable = (
    completed: InstructorData[],
    missing: InstructorData[]
  ) => {
    const combinedData = mergeInstructorData(completed, missing);

    return (
      <table>
        <thead>
          <tr>
            <th>
              <h5>INSTRUCTOR ID</h5>
            </th>
            <th>
              <h5>INSTRUCTOR NAME</h5>
            </th>
            <th>
              <h5>COURSE SUBJECT</h5>
            </th>
            <th>
              <h5>STATUS</h5>
            </th>
          </tr>
        </thead>
        <tbody>
          {combinedData.map((row) => (
            <tr key={row.profId}>
              <td>{row.profId}</td>
              <td>{row.professorName}</td>
              <td style={{ color: row.status === "Missed" ? "red" : "green" }}>
                {row.subjects}
              </td>
              <td style={{ color: row.status === "Missed" ? "red" : "green" }}>
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Log missingData after it changes
  useEffect(() => {
    console.log("Updated missingData:", missingData);
  }, [missingData]);

  return (
    <>
      <div className={styles.encodingChecklist} style={{ height: "100%" }}>
        <div
          className={styles.header}
          style={{
            margin: "20px 20px 0px 20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ paddingLeft: "15px", marginTop: "0" }}>
            Encoding Checklist
          </h2>
          <div>
            <label
              htmlFor="academicYear"
              style={{ textWrap: "nowrap", paddingRight: "10px" }}
            >
              Academic Year:
            </label>
            <select
              id="academicYear"
              value={selectedAcadYr}
              onChange={handleAcadYrChange}
            >
              {academicYearOptions.map((acadYr) => (
                <option key={acadYr} value={acadYr}>
                  {acadYr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="sem"
              style={{ textWrap: "nowrap", paddingRight: "10px" }}
            >
              Semester:
            </label>
            <select id="sem" value={selectedSem} onChange={handleSemChange}>
              {activeSems.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
              {activeSems.includes("First") && (
                <option value="Second">Second</option>
              )}
              {activeSems.includes("Second") && (
                <option value="First">First</option>
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="term"
              style={{ textWrap: "nowrap", paddingRight: "10px" }}
            >
              Term:
            </label>
            <select
              id="term"
              value={selectedTerm}
              onChange={handleTermChange}
              disabled={disableTerm}
            >
              <option value="" disabled={true}>
                All
              </option>
              {["PRELIM", "MIDTERM", "FINAL"].map((term) => {
                if (activeTerms.includes(term.toLowerCase())) {
                  return (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  );
                }
                return null;
              })}
            </select>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
            }}
          >
            <button
              className={styles.submit}
              style={{ borderRadius: "10px", height: "40px" }}
            >
              PRINT MEMO
            </button>
          </div>
        </div>
        <main
          className={style.main}
          style={{ paddingLeft: "10px", width: "97%" }}
        >
          <section>
            <div className={style.StudentList} style={{ marginLeft: "10px" }}>
              {renderTable(completedData, missingData)}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default EncodingChecklist;
