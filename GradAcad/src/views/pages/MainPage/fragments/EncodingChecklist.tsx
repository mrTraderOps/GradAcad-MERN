import styles from "../styles/GradingPeriod.module.scss";
import style from "../fragments/students_panel/styles/StudentsPanel.module.scss";
import { useTerm } from "../../../../hooks/useTerm";
import { useContext, useEffect, useState } from "react";
import API from "../../../../context/axiosInstance";
import { UserContext } from "../../../../context/UserContext";
import loadingAnimation from "../../../../assets/webM/loading.webm";
import notfound from "../../../../assets//images/notfound.jpg";

interface InstructorData {
  professorName: string;
  profId: string;
  email: string;
  subjects: string[];
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

  const {
    activeSems,
    initialAcadYr,
    initialSem,
    donePrelim,
    doneMidterm,
    doneFinal,
  } = useTerm();

  let initialTerm = "";

  if (donePrelim && doneMidterm && doneFinal) {
    initialTerm = "FINAL";
  } else if (donePrelim && doneMidterm) {
    initialTerm = "MIDTERM";
  } else if (donePrelim) {
    initialTerm = "PRELIM";
  }

  const [selectedAcadYr, setSelectedAcadYr] = useState<string>(initialAcadYr);
  const [selectedSem, setSelectedSem] = useState<string>(initialSem);
  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm);
  const [missingData, setMissingData] = useState<InstructorData[]>([]);
  const [completedData, setCompletedData] = useState<InstructorData[]>([]);
  const [disableTerm, setDisableTerm] = useState<boolean>(false);
  const [isDoneInitial, setIsDoneInitial] = useState<boolean>(false);
  const [loading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  // 1. Initialization
  useEffect(() => {
    setSelectedAcadYr(initialAcadYr);
    setSelectedSem(initialSem);

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
    setError(false);
    setIsLoading(true);
    try {
      let response;

      if (Array.isArray(dept)) {
        const responses = await Promise.all([
          API.post("/grade/fetchMissingEnrollmentByDept", {
            acadYr: selectedAcadYr,
            dept: dept[0], // BSED
            sem: selectedSem,
            terms: selectedTerm || "",
          }),
          API.post("/grade/fetchMissingEnrollmentByDept", {
            acadYr: selectedAcadYr,
            dept: dept[1], // BEED
            sem: selectedSem,
            terms: selectedTerm || "",
          }),
        ]);

        // Combine both results into one array
        const combinedData = [
          ...responses[0].data.data,
          ...responses[1].data.data,
        ];
        setMissingData(combinedData);
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
      setError(true);
      setMissingData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompletedEnrollmentByDept = async () => {
    setError(false);
    setIsLoading(true);
    try {
      if (Array.isArray(dept)) {
        const responses = await Promise.all([
          API.post("/grade/fetchCompletedEnrollmentByDept", {
            acadYr: selectedAcadYr,
            dept: dept[0], // BSED
            sem: selectedSem,
            terms: selectedTerm || "",
          }),
          API.post("/grade/fetchCompletedEnrollmentByDept", {
            acadYr: selectedAcadYr,
            dept: dept[1], // BEED
            sem: selectedSem,
            terms: selectedTerm || "",
          }),
        ]);

        // Combine both results into one array
        const combinedData = [
          ...responses[0].data.data,
          ...responses[1].data.data,
        ];
        setCompletedData(combinedData);
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
      setError(true);
      setCompletedData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const notifyProfMissingSubject = async (
    instructorsData: InstructorData[]
  ) => {
    try {
      // Transform data to match backend expectations
      const formattedData = instructorsData.map((instructor) => ({
        to: instructor.email,
        username: instructor.professorName,
        subjectIds: instructor.subjects,
      }));

      // Disable the button before sending request
      setIsButtonDisabled(true);

      const response = await API.post("/email/notifyEmailMissedSubjects", {
        instructors: formattedData,
      });

      if (response.data.success) {
        alert("Emails sent successfully!");
      } else {
        alert("Some emails failed to send:");
      }
    } catch (error) {
      alert("Error sending email notifications:");
    } finally {
      // Cooldown time after sending emails (e.g., 5 seconds)
      setTimeout(() => {
        setIsButtonDisabled(false); // Re-enable button after cooldown
      }, 360000); // 5 seconds cooldown
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
      setSelectedSem(initialSem);
      setSelectedTerm(initialTerm);
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
    if (!Array.isArray(missing)) {
      console.error("Missing data is not an array");
      return [];
    }

    // Build a map of missing subjects
    const missingSubjectsMap: { [profId: string]: string[] } = {};
    const missingNameMap: { [profId: string]: string } = {};

    missing.forEach((data) => {
      if (!missingSubjectsMap[data.profId]) {
        missingSubjectsMap[data.profId] = [];
      }
      if (Array.isArray(data.subjects)) {
        missingSubjectsMap[data.profId].push(...data.subjects);
      }
      missingNameMap[data.profId] = data.professorName;
    });

    // Same for completed
    const completedSubjectsMap: { [profId: string]: string[] } = {};
    const completedNameMap: { [profId: string]: string } = {};

    completed.forEach((data) => {
      if (!completedSubjectsMap[data.profId]) {
        completedSubjectsMap[data.profId] = [];
      }
      if (Array.isArray(data.subjects)) {
        completedSubjectsMap[data.profId].push(...data.subjects);
      }
      completedNameMap[data.profId] = data.professorName;
    });

    const allProfIds = new Set([
      ...Object.keys(missingSubjectsMap),
      ...Object.keys(completedSubjectsMap),
    ]);

    const combinedData: TableRowData[] = Array.from(allProfIds).map(
      (profId) => {
        const missingSubjects = missingSubjectsMap[profId] || [];
        const professorName =
          completedNameMap[profId] || missingNameMap[profId] || "Unknown";

        if (missingSubjects.length > 0) {
          return {
            profId,
            professorName,
            subjects: missingSubjects.join(", "),
            status: "Missed",
          };
        }

        return {
          profId,
          professorName,
          subjects: "All Completed",
          status: "Done",
        };
      }
    );

    return combinedData;
  };

  const renderTable = (
    completed: InstructorData[],
    missing: InstructorData[]
  ) => {
    const combinedData = mergeInstructorData(completed, missing);

    return (
      <table id="profTable">
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
              {donePrelim && <option value="PRELIM">PRELIM</option>}
              {doneMidterm && <option value="MIDTERM">MIDTERM</option>}
              {doneFinal && <option value="FINAL">FINAL</option>}
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
              onClick={() => {
                notifyProfMissingSubject(missingData);
              }}
              disabled={isButtonDisabled}
            >
              NOTIFY MISSED
            </button>
          </div>
        </div>
        <main
          className={style.main}
          style={{ paddingLeft: "10px", width: "97%" }}
        >
          <section>
            <div className={style.StudentList} style={{ marginLeft: "10px" }}>
              {!loading ? (
                renderTable(completedData, missingData)
              ) : (
                <div
                  className={styles.loading}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <h3>Loading.. Please Wait</h3>
                  <video
                    autoPlay
                    loop
                    muted
                    className={styles.loadingAnimation}
                    height={50}
                  >
                    <source src={loadingAnimation} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <img src={notfound} alt="not found" width={450} />
                  <h3>
                    No found instructor for specified Academic Year, Semester or
                    Term.
                  </h3>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default EncodingChecklist;
