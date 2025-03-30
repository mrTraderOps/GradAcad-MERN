import styles from "../styles/GradingPeriod.module.scss";
import style from "../fragments/students_panel/styles/StudentsPanel.module.scss";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../context/UserContext";
import axios from "axios";

const GradingPeriod = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [acadYr, setAcadYr] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [term, setTerm] = useState<string>("");

  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [currentAcadYr, setCurrentAcadYr] = useState<string>("");
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [currentSem, setCurrentSem] = useState<string>("");
  const [semesters, setSemesters] = useState<string[]>([]);
  const [terms, setTerms] = useState<string[]>([]);

  const [isPage2, setPage2] = useState<boolean>(false);

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/grade/getTermsV2"
        );
        if (response.data.success && response.data.data.length > 0) {
          const {
            acadYr: currentAcadYr,
            sem,
            term,
            prelimDone,
            midtermDone,
            finalDone,
          } = response.data.data[0];

          // Generate the next academic year
          const nextAcadYr = generateNextAcademicYear(currentAcadYr);

          // Populate academic years based on conditions
          let availableAcadYears = [currentAcadYr];

          const donePrelim = prelimDone && term.prelim === true;
          const doneMidterm = midtermDone && term.midterm === true;
          const doneFinal = finalDone && term.final === true;

          const AllDone =
            donePrelim && doneMidterm && doneFinal && sem.Second === true;

          const DoneFirstSem =
            donePrelim && doneMidterm && doneFinal && sem.First === true;

          if (AllDone) {
            availableAcadYears = [nextAcadYr];
          }

          let availableSemesters: string[] = [];

          if (AllDone) {
            availableSemesters = ["First"];
          } else if (DoneFirstSem) {
            availableSemesters = ["Second"];
          } else {
            availableSemesters = ["First"];
          }

          // Determine available terms based on conditions
          let availableTerms: string[] = [];
          if (DoneFirstSem) {
            availableTerms = ["prelim"];
          } else if (!prelimDone && !midtermDone && !finalDone) {
            availableTerms = ["prelim"];
          } else if (prelimDone && !midtermDone) {
            availableTerms = ["midterm"];
          } else if (prelimDone && midtermDone && !finalDone) {
            availableTerms = ["final"];
          } else if (AllDone) {
            availableTerms = ["prelim"];
          }

          setCurrentAcadYr(currentAcadYr);
          setAcademicYears(availableAcadYears);
          setSemesters(availableSemesters);
          setTerms(availableTerms);
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
      }
    };

    fetchData();
  }, []);

  const generateNextAcademicYear = (currentAcadYr: string): string => {
    const [startYear, endYear] = currentAcadYr.split(" - ").map(Number);
    return `${startYear + 1} - ${endYear + 1}`;
  };

  const validateForm = () => {
    let tempErrors: { [key: string]: string } = {};

    if (!startDate) tempErrors.startDate = "Start Date is required.";
    if (!endDate) tempErrors.endDate = "End Date is required.";
    if (startDate && endDate && endDate < startDate) {
      tempErrors.endDate = "End Date cannot be earlier than Start Date.";
    }
    if (!startTime) tempErrors.startTime = "Start Time is required.";
    if (!endTime) tempErrors.endTime = "End Time is required.";
    if (!acadYr) tempErrors.semester = "Academic Year selection is required.";
    if (!semester) tempErrors.semester = "Semester selection is required.";
    if (!term) tempErrors.term = "Term selection is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      if (acadYr !== currentAcadYr) {
        try {
          // Define the updated grading period payload
          const updatedData = {
            acadYr, // New selected academic year
            sem: {
              First: true,
              Second: false,
            },
            term: {
              prelim: true,
              midterm: false,
              final: false,
            },
            prelimDone: false,
            midtermDone: false,
            finalDone: false,
          };

          // Send PUT request to update the grading period
          const response = await axios.put(
            "http://localhost:5000/api/v1/grade/updateGradingPeriod",
            updatedData
          );

          if (response.data.success) {
            alert(response.data.message);
          } else {
            alert(response.data.message);
          }
        } catch (error) {
          console.error("Error updating grading period:", error);
          alert("Failed to update the grading period.");
        }
      } else {
        try {
          const updatedData = {
            acadYr,
            sem: {
              First: true,
              Second: false,
            },
            term: {
              prelim: true,
              midterm: false,
              final: false,
            },
          };

          // Send PUT request to update the grading period
          const response = await axios.put(
            "http://localhost:5000/api/v1/grade/updateGradingPeriodV2",
            updatedData
          );

          if (response.data.success) {
            alert(response.data.message);
          } else {
            alert(response.data.message);
          }
        } catch (error) {
          console.error("Error updating grading period:", error);
          alert("Failed to update the grading period.");
        }
      }
    }
  };

  return (
    <>
      <div className={styles.gradingPeriod} style={{ height: "100%" }}>
        {isPage2 ? (
          <>
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
                Grade Revision Request
              </h2>
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
                  Set Request
                </button>
                <button
                  className={styles.submit}
                  style={{ borderRadius: "10px", height: "40px" }}
                >
                  History
                </button>
                <button
                  className={styles.submit}
                  style={{ borderRadius: "10px", height: "40px" }}
                  onClick={() => setPage2((prev) => !prev)}
                >
                  Current Grading Period {"-->"}
                </button>
              </div>
            </div>
            <main className={style.main} style={{ paddingLeft: "10px" }}>
              <section>
                <div
                  className={style.StudentList}
                  style={{ marginLeft: "10px" }}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>
                          <h5>REQUEST ID</h5>
                        </th>
                        <th>
                          <h5>INSTRUCTOR ID</h5>
                        </th>
                        <th>
                          <h5>INSTRUCTOR'S NAME</h5>
                        </th>
                        <th>
                          <h5>OPENED SUBJECT</h5>
                        </th>
                        <th>
                          <h5>ACTION</h5>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>234324</td>
                        <td>INST-001</td>
                        <td>MICHAEL MANGAHAS</td>
                        <td>
                          <strong>
                            FRELEC 101 - PRELIM - 2ND SEM - A.Y. 2024
                          </strong>
                        </td>
                        <td>
                          <button
                            style={{
                              backgroundColor: "rgb(176, 17, 17)",
                              cursor: "pointer",
                              position: "unset",
                              borderRadius: "5px",
                            }}
                          >
                            CLOSE
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </main>
          </>
        ) : (
          <>
            <div
              className={styles.header}
              style={{
                margin: "20px 20px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ paddingLeft: "15px", marginTop: "0" }}>
                Current Grading Period
              </h2>
              <button
                className={styles.submit}
                style={{ borderRadius: "10px", height: "40px" }}
                onClick={() => setPage2((prev) => !prev)}
              >
                Grade Revision Request {"-->"}
              </button>
            </div>
            <main style={{ display: "flex", flexDirection: "row" }}>
              <div className={styles.container1}>
                <h2>Select Filter</h2>
                <div className={styles.grid}>
                  <div>
                    <div className={styles.field}>
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={
                          startDate ? startDate.toISOString().split("T")[0] : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setStartDate(dateValue);

                          // Clear error when the user inputs a valid date
                          setErrors((prev) => ({
                            ...prev,
                            startDate: dateValue
                              ? ""
                              : "Start Date is required",
                          }));

                          // Validate if end date is earlier than start date
                          if (endDate && dateValue && dateValue > endDate) {
                            setErrors((prev) => ({
                              ...prev,
                              endDate:
                                "End Date should not be earlier than Start Date",
                            }));
                          } else {
                            setErrors((prev) => ({ ...prev, endDate: "" }));
                          }
                        }}
                      />
                      {errors.startDate && (
                        <p className={styles.error}>{errors.startDate}</p>
                      )}
                    </div>
                    <div className={styles.field}>
                      <label>End Date *</label>
                      <input
                        type="date"
                        value={
                          endDate ? endDate.toISOString().split("T")[0] : ""
                        }
                        onChange={(e) => {
                          const dateValue = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setEndDate(dateValue);

                          // Clear error when the user inputs a valid date
                          setErrors((prev) => ({
                            ...prev,
                            endDate: dateValue ? "" : "End Date is required",
                          }));

                          // Validate if end date is earlier than start date
                          if (endDate && dateValue && dateValue > endDate) {
                            setErrors((prev) => ({
                              ...prev,
                              endDate:
                                "End Date should not be earlier than Start Date",
                            }));
                          } else {
                            setErrors((prev) => ({ ...prev, endDate: "" }));
                          }
                        }}
                      />
                      {errors.endDate && (
                        <p className={styles.error}>{errors.endDate}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className={styles.field}>
                      <label>Start Time *</label>
                      <input
                        type="time"
                        onChange={(e) => {
                          setStartTime(e.target.value);
                          setErrors((prev) => ({ ...prev, startTime: "" })); // Clear error
                        }}
                      />
                      {errors.startTime && (
                        <p className={styles.error}>{errors.startTime}</p>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label>End Time *</label>
                      <input
                        type="time"
                        onChange={(e) => {
                          setEndTime(e.target.value);
                          setErrors((prev) => ({ ...prev, endTime: "" })); // Clear error
                        }}
                      />
                      {errors.endTime && (
                        <p className={styles.error}>{errors.endTime}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className={styles.field}>
                      <label>Academic Year *</label>
                      <select
                        value={acadYr}
                        onChange={(e) => {
                          setAcadYr(e.target.value);
                          setErrors((prev) => ({ ...prev, acadYr: "" }));
                        }}
                      >
                        <option value="">Select an Academic Year</option>
                        {academicYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      {errors.acadYr && (
                        <p className={styles.error}>{errors.acadYr}</p>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label>Semester *</label>
                      <select
                        value={semester}
                        onChange={(e) => {
                          setSemester(e.target.value);
                          setErrors((prev) => ({ ...prev, semester: "" }));
                        }}
                      >
                        <option value="">Select a Semester...</option>
                        {semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            {sem === "First" ? "1st Semester" : "2nd Semester"}
                          </option>
                        ))}
                      </select>
                      {errors.semester && (
                        <p className={styles.error}>{errors.semester}</p>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label>Term *</label>
                      <select
                        value={term}
                        onChange={(e) => {
                          setTerm(e.target.value);
                          setErrors((prev) => ({ ...prev, term: "" }));
                        }}
                      >
                        <option value="">Select a Term...</option>
                        {terms.map((t) => (
                          <option key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}{" "}
                            {/* Capitalize first letter */}
                          </option>
                        ))}
                      </select>
                      {errors.term && (
                        <p className={styles.error}>{errors.term}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.buttons}>
                  <div>
                    <button className={styles.discard} disabled>
                      Discard
                    </button>
                    <button className={styles.submit} onClick={handleSubmit}>
                      Submit
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.container2}>
                <p>
                  <span>Academic Year: </span>
                  <strong>2024 - 2025</strong>
                </p>
                <p>
                  <span>Semester: </span> <strong>Second</strong>
                </p>
                <p>
                  <span>Term: </span> <strong>PRELIM</strong>
                </p>

                <div className={styles.timeInfo}>
                  <p>
                    Start Time: <strong>{startTime}</strong>
                  </p>
                  <p>
                    Last Day End Time: <strong>{endTime}</strong>
                  </p>
                </div>

                <div className={styles.calendar}>
                  <iframe
                    src="https://calendar.google.com/calendar/embed?mode=MONTH"
                    title="Calendar"
                    className={styles.calendarFrame}
                  ></iframe>
                </div>
                <div className={styles.buttons}>
                  <button className={styles.disabledBtn} disabled>
                    Open
                  </button>
                  <button className={styles.closeBtn}>Close</button>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </>
  );
};

export default GradingPeriod;
