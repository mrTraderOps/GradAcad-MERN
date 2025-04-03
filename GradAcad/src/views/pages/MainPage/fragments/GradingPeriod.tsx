import styles from "../styles/GradingPeriod.module.scss";
import style from "../fragments/students_panel/styles/StudentsPanel.module.scss";
import { useEffect, useState } from "react";
import axios from "axios";
import { RevisionRequest } from "@/views/components/RevisionRequest";

interface GradeRequest {
  requestId: string;
  refId: string;
  name: string;
  subjectId: string;
  acadYr: string;
  sem: string;
  dept: string;
  sect: string;
  term: string;
  isActive: boolean;
}

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
  const [pendingGradingPeriod, setPendingGradingPeriod] = useState<boolean>();
  const [gradeRequests, setGradeRequests] = useState<GradeRequest[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [gradingData, setGradingData] = useState<{
    acadYr: string;
    semester: string;
    term: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  const [isPage2, setPage2] = useState<boolean>(false);

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

          const currentSem = sem.First ? "First" : sem.Second ? "Second" : "";

          // Generate the next academic year
          const nextAcadYr = generateNextAcademicYear(currentAcadYr);

          // Populate academic years based on conditions
          let availableAcadYears = [currentAcadYr];

          const donePrelim = prelimDone && term.prelim === true;
          const doneMidterm = midtermDone && term.midterm === true;
          const doneFinal = finalDone && term.final === true;

          const DoneAllTerm = donePrelim && doneMidterm && doneFinal;

          const DoneSecondSem = DoneAllTerm && sem.Second === true;
          const DoneFirstSem = DoneAllTerm && sem.First === true;
          const OnGoingSecondSem = !DoneAllTerm && sem.Second === true;
          const OnGoingFirstSem = !DoneAllTerm && sem.First === true;

          if (DoneSecondSem) {
            availableAcadYears = [nextAcadYr];
          }

          let availableSemesters: string[] = [];

          if (DoneSecondSem) {
            availableSemesters = ["First"];
          } else if (DoneFirstSem) {
            availableSemesters = ["Second"];
          } else if (OnGoingSecondSem) {
            availableSemesters = ["Second"];
          } else if (OnGoingFirstSem) {
            availableSemesters = ["First"];
          }

          let availableTerms: string[] = [];
          if (DoneFirstSem) {
            availableTerms = ["prelim"];
          } else if (!prelimDone && !midtermDone && !finalDone) {
            availableTerms = ["prelim"];
          } else if (prelimDone && !midtermDone) {
            availableTerms = ["midterm"];
          } else if (prelimDone && midtermDone && !finalDone) {
            availableTerms = ["final"];
          } else if (DoneSecondSem) {
            availableTerms = ["prelim"];
          }

          setCurrentAcadYr(currentAcadYr);
          setAcademicYears(availableAcadYears);
          setCurrentSem(currentSem);
          setSemesters(availableSemesters);
          setTerms(availableTerms);
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
      }
    };

    fetchData();
    fetchPending();
    fetchGrading();
    fetchGradeRequest();
  }, []);

  const fetchPending = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/grade/pendingGradingPeriod"
      );
      if (response.data.success) {
        setPendingGradingPeriod(response.data.isPending ?? false);
      }
    } catch (error) {
      console.error("Error fetching active:", error);
    }
  };

  const fetchGrading = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/grade/getGradingPeriod"
      );

      if (response.data.success && response.data.data) {
        const {
          currentAcadYr,
          setSem,
          setTerm,
          startDate,
          endDate,
          startTime,
          endTime,
        } = response.data.data;

        // Ensure there's valid data before setting state
        if (setSem || setTerm || startDate || endDate || startTime || endTime) {
          setGradingData({
            acadYr: currentAcadYr ?? "",
            semester: setSem ?? "",
            term: setTerm ?? "",
            startDate: formatDateForCalendar(startDate),
            endDate: formatDateForCalendar(endDate),
            startTime: formatTime(startTime), // Convert to 12-hour format
            endTime: formatTime(endTime), // Convert to 12-hour format
          });
        } else {
          setGradingData(null);
        }
      }
    } catch (error) {
      console.error("Error fetching grading period:", error);
      setGradingData(null);
    }
  };

  const fetchGradeRequest = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/grade/fetchAllRequest"
      );

      if (response.data.success && response.data.data) {
        setGradeRequests(response.data.data); // Store fetched data in state
      }
    } catch (error) {
      console.error("Error fetching grading period:", error);
    }
  };

  const closeRequest = async (requestId: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/grade/closeRequest",
        {
          requestId,
        }
      );

      if (response.data.success) {
        alert("Request successfully closed.");
        setGradeRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.requestId === requestId ? { ...req, isActive: false } : req
          )
        );
      } else {
        alert(response.data.message || "Failed to close request.");
      }
    } catch (error) {
      console.error("Error closing request:", error);
      alert("An error occurred while closing the request.");
    }
  };

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
      try {
        let response;

        if (!startDate || !startTime || !endDate || !endTime) {
          console.error("All fields are required");
          return;
        }

        // Combine startDate and startTime correctly
        const startAt = new Date(startDate);
        const [startHours, startMinutes] = startTime.split(":");
        startAt.setHours(
          parseInt(startHours, 10),
          parseInt(startMinutes, 10),
          0
        );

        // Combine endDate and endTime correctly
        const endAt = new Date(endDate);
        const [endHours, endMinutes] = endTime.split(":");
        endAt.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0);

        console.log("Start At:", startAt.toISOString());
        console.log("End At:", endAt.toISOString());

        if (acadYr !== currentAcadYr) {
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
            startDate,
            endDate,
            startAt,
            endAt,
            setSem: semester,
            setTerm: term,
            startTime,
            endTime,
          };

          response = await axios.put(
            "http://localhost:5000/api/v1/grade/updateGradingPeriod",
            updatedData
          );
        } else if (acadYr === currentAcadYr && semester === currentSem) {
          const updatedTerm = {
            prelim: term === "prelim" || term === "midterm" || term === "final",
            midterm: term === "midterm" || term === "final",
            final: term === "final",
          };

          const updatedData = {
            term: updatedTerm,
            startAt,
            endAt,
            setSem: semester,
            setTerm: term,
            startDate,
            endDate,
            startTime,
            endTime,
          };

          response = await axios.put(
            "http://localhost:5000/api/v1/grade/updateGradingPeriodV2",
            updatedData
          );
        } else if (acadYr === currentAcadYr && semester !== currentSem) {
          const updatedSem = {
            First: false,
            Second: true,
          };

          const updatedTerm = {
            prelim: true,
            midterm: false,
            final: false,
          };

          const updatedData = {
            sem: updatedSem,
            term: updatedTerm,
            prelimDone: false,
            midtermDone: false,
            finalDone: false,
            startAt,
            endAt,
            setSem: semester,
            setTerm: term,
            startDate,
            endDate,
            startTime,
            endTime,
          };

          response = await axios.put(
            "http://localhost:5000/api/v1/grade/updateGradingPeriodV3",
            updatedData
          );
        }

        if (response && response.data.success) {
          await fetchPending();
          await fetchGrading();

          // ✅ Clear all inputs after successful submission
          setStartDate(null);
          setEndDate(null);
          setStartTime("");
          setEndTime("");
          setAcadYr("");
          setSemester("");
          setTerm("");
          setErrors({}); // Clear all validation errors

          alert(response.data.message);
        } else {
          alert("Failed to update grading period.");
        }
      } catch (error) {
        console.error("Error updating grading period:", error);
        alert("Failed to update the grading period.");
      }
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateForCalendar = (dateString: string | null) => {
    if (!dateString) return "";

    const date = new Date(dateString); // Convert ISO string to Date object

    if (isNaN(date.getTime())) return ""; // Handle invalid date

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${month}-${day}-${year}`; // MM-DD-YYYY format
  };

  const handleCancelSubmit = () => {
    setShowModal(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to avoid issues

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
                  onClick={() => setShowModal(true)}
                >
                  Set Request
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
                      {gradeRequests.length > 0 ? (
                        gradeRequests.map((request: GradeRequest) => (
                          <tr key={request.requestId}>
                            <td>{request.requestId}</td>
                            <td>{request.refId}</td>
                            <td>{request.name}</td>
                            <td>
                              <strong>
                                {`${request.subjectId} - ${request.term} - ${request.sem} - A.Y. ${request.acadYr}`}
                              </strong>
                            </td>
                            <td>
                              {request.isActive ? (
                                <button
                                  style={{
                                    backgroundColor: "rgb(176, 17, 17)",
                                    cursor: "pointer",
                                    position: "unset",
                                    borderRadius: "5px",
                                  }}
                                  onClick={() =>
                                    closeRequest(request.requestId)
                                  }
                                >
                                  CLOSE
                                </button>
                              ) : (
                                <button
                                  style={{
                                    backgroundColor: "gray",
                                    cursor: "not-allowed",
                                    position: "unset",
                                    borderRadius: "5px",
                                  }}
                                  disabled={true}
                                >
                                  Closed
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center" }}>
                            No requests found
                          </td>
                        </tr>
                      )}
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
                Grade Period
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

                          console.log("Start Date:", dateValue);

                          // Validation for Start Date
                          if (!dateValue) {
                            setErrors((prev) => ({
                              ...prev,
                              startDate: "Start Date is required",
                            }));
                          } else if (dateValue < today) {
                            setErrors((prev) => ({
                              ...prev,
                              startDate:
                                "Start Date should not be earlier than today",
                            }));
                          } else {
                            setErrors((prev) => ({ ...prev, startDate: "" }));
                          }

                          // Ensure End Date is not earlier than Start Date
                          if (endDate && dateValue && endDate < dateValue) {
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

                          console.log("End Date:", dateValue);

                          // Validation for End Date
                          if (!dateValue) {
                            setErrors((prev) => ({
                              ...prev,
                              endDate: "End Date is required",
                            }));
                          } else if (startDate && dateValue < startDate) {
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
                    <button
                      className={
                        pendingGradingPeriod
                          ? styles.submitPending
                          : styles.submit
                      }
                      onClick={handleSubmit}
                      disabled={pendingGradingPeriod}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
              {gradingData && (
                <div className={styles.container2}>
                  <h4
                    style={{
                      margin: "0",
                      textAlign: "center",
                      paddingBottom: "10px",
                    }}
                  >
                    Active Grading Period
                  </h4>
                  <p>
                    <span>Academic Year: </span>
                    <strong>{gradingData.acadYr}</strong>
                  </p>
                  <p>
                    <span>Semester: </span>{" "}
                    <strong>{gradingData.semester.toUpperCase()}</strong>
                  </p>
                  <p>
                    <span>Term: </span>{" "}
                    <strong>{gradingData.term.toUpperCase()}</strong>
                  </p>
                  <div className={styles.timeInfo}>
                    <p>
                      Start Date: <strong>{gradingData.startDate}</strong>
                    </p>
                    <p>
                      End Date: <strong>{gradingData.endDate}</strong>
                    </p>
                  </div>
                  <div className={styles.timeInfo}>
                    <p>
                      Start Time: <strong>{gradingData.startTime}</strong>
                    </p>
                    <p>
                      Last Day End Time: <strong>{gradingData.endTime}</strong>
                    </p>
                  </div>
                </div>
              )}
            </main>
          </>
        )}
      </div>
      <RevisionRequest
        isOpen={showModal}
        onCancel={handleCancelSubmit}
        onRefetch={fetchGradeRequest}
      />
    </>
  );
};

export default GradingPeriod;
