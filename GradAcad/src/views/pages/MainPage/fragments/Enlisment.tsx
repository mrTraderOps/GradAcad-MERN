import styles from "../fragments/students_panel/styles/StudentsPanel.module.scss";
import style from "../styles/Department.module.scss";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../context/UserContext";
import notfound from "../../../../assets/images/notfound.jpg";
import loadingAnimation from "../../../../assets/webM/loading.webm";
import { EnlismentReport } from "../../../components/EnlistmentReport";
import API from "../../../../context/axiosInstance";

interface Student {
  _id: string;
  LastName: string;
  FirstName: string;
  MiddleInitial?: string;
  SectionId: string;
}

interface EnlistmentReport {
  acadYr: string;
  sem: string;
  subjectId: string;
  dept: string;
  sect: string;
  instructor: string;
  students: Student[];
}

const Enlisment = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { confirmData } = context;

  const { acadYr, sem, subjCode, dept, sect } = confirmData[0] || {};

  const [showModal, setShowModal] = useState(true);
  const [showModal2, setShowModal2] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<EnlistmentReport[]>([]);

  const [studentId, setStudentId] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [firstName, setFirstName] = useState("");

  const [errors, setErrors] = useState({
    studentId: "",
    lastName: "",
    middleInitial: "",
    firstName: "",
  });

  const handleFetchEnlist = async () => {
    setLoading(true);
    try {
      const response = await API.post("/grade/enlistmentReport", {
        acadYr,
        sem,
        subjCode,
        dept,
        sect,
      });

      if (response.data.success) {
        setEnrollmentData(response.data.data);
        setLoading(false);
      } else {
        setEnrollmentData([]); // Set empty array if no data
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      setEnrollmentData([]);
    }
  };

  useEffect(() => {
    handleFetchEnlist();
  }, [showModal]);

  const handleCancelSubmit = () => {
    setShowModal(false);
    setEnrollmentData([]);
  };

  const openModal = () => setShowModal2(true);
  const closeModal = () => setShowModal2(false);

  const validateForm = () => {
    let newErrors = {
      studentId: "",
      lastName: "",
      middleInitial: "",
      firstName: "",
    };
    let isValid = true;

    // ✅ Validate Student ID (Format: 2020-0231)
    const studentIdPattern = /^\d{4}-\d{4}$/;
    if (!studentId.match(studentIdPattern)) {
      newErrors.studentId =
        "Student ID must be in format YYYY-NNNN (e.g., 2020-0231)";
      isValid = false;
    }

    // ✅ Validate Last Name (Only Letters)
    if (!/^[A-Za-z]+$/.test(lastName)) {
      newErrors.lastName = "Last Name must contain only letters";
      isValid = false;
    }

    // ✅ Validate First Name (Only Letters)
    if (!/^[A-Za-z]+$/.test(firstName)) {
      newErrors.firstName = "First Name must contain only letters";
      isValid = false;
    }

    // ✅ Validate Middle Initial (Only 1 Letter)
    if (!/^[A-Za-z]{1}$/.test(middleInitial)) {
      newErrors.middleInitial = "Middle Initial must be a single letter";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const capitalizeFirstLetter = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    if (name === "studentId") {
      setStudentId(value);
    } else if (name === "lastName") {
      setLastName(capitalizeFirstLetter(value));
    } else if (name === "middleInitial") {
      setMiddleInitial(value.toUpperCase());
    } else if (name === "firstName") {
      setFirstName(capitalizeFirstLetter(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (
        !subjCode ||
        !acadYr ||
        !sem ||
        !dept ||
        !sect ||
        !studentId ||
        !lastName ||
        !firstName
      ) {
        alert("Something went wrong, please try again later.");
        return;
      }

      const validData = {
        acadYr,
        sem,
        dept,
        sect,
        subjectId: subjCode,
        studentId,
        lastName,
        firstName,
        middleInitial,
      };

      const addStudent = async () => {
        try {
          setLoading2(true);
          const response = await API.post("/student/addStudent", validData);

          if (response.data.success) {
            alert("Student added successfully!");
            setLoading2(false);
            handleFetchEnlist();
            setTimeout(() => {
              setShowModal2(false);
            }, 1000);
          } else {
            alert(
              response.data.message || "Failed to Add student. Please try Again"
            );
            setLoading2(false);
          }
        } catch (error: any) {
          alert(
            error.response.data.message ||
              "Failed to add student. Please try Again"
          );
          setLoading2(false);
        } finally {
          setLoading2(false);
        }
      };

      addStudent();
    } else {
      alert("Invalid input when adding a student");
    }
  };

  const handleDeleteStudent = async (
    studentId: string,
    LastName: string,
    FirstName: string,
    subjectId: string,
    acadYr: string,
    sem: string,
    dept: string,
    sect: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${LastName}, ${FirstName} ?`
      )
    ) {
      return;
    }
    try {
      const response = await API.delete("/student/deleteStudent", {
        data: { subjectId, acadYr, sem, dept, sect, studentId },
      });

      if (response.status === 200) {
        alert("Student deleted successfully!");
        handleFetchEnlist();
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
  };

  if (!confirmData || confirmData.length === 0) {
    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <img src={notfound} alt="not found" width={600} />
          <p>No data found. Click Select a Subject to view data.</p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#293F74",
              color: "#fff",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Select a Subject
          </button>
        </div>
        <EnlismentReport
          isOpen={showModal}
          onCancel={handleCancelSubmit}
          onRefetch={handleFetchEnlist}
        />
      </>
    );
  }

  return (
    <>
      <div className={style.department}>
        {enrollmentData.map((enlist) => (
          <div key={enlist.subjectId}>
            {" "}
            {/* ✅ Fix: Add unique key */}
            <div className={styles.preloader}>
              <p>Subject &gt; Section </p>
              <p>
                <strong>
                  {enlist.sem} Semester A.Y. {enlist.acadYr}
                </strong>
              </p>
            </div>
            <header className={styles.headerStudentsPanel}>
              <div className={styles.div2}>
                <p>SUBJECT CODE: </p>
                <strong style={{ color: "#0F2A71", fontWeight: "bold" }}>
                  {enlist.subjectId}
                </strong>
              </div>
              <div className={styles.div2}>
                <p>
                  COURSE & SECTION :{" "}
                  <strong style={{ color: "#0F2A71", fontWeight: "bold" }}>
                    {enlist.dept} - {enlist.sect}
                  </strong>
                </p>
                <p>
                  INSTRUCTOR :{" "}
                  <strong style={{ color: "#0F2A71", fontWeight: "bold" }}>
                    {enlist.instructor.toUpperCase()}
                  </strong>
                </p>
              </div>
              <div className={styles.div3}>
                <button
                  style={{ backgroundColor: "#0F2A71", borderRadius: "10px" }}
                  onClick={openModal}
                >
                  ADD STUDENT
                </button>
              </div>
            </header>
            <main className={styles.main}>
              <section>
                <div
                  className={styles.StudentList}
                  style={{ maxHeight: "clamp(200px, 68vh, 600px)" }}
                >
                  {loading && <p className={styles.loading}>Loading data...</p>}
                  {!loading && (
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <h5>NO.</h5>
                          </th>
                          <th>
                            <h5>STUDENT ID</h5>
                          </th>
                          <th>
                            <h5>STUDENT NAME</h5>
                          </th>
                          <th>
                            <h5>ACTION</h5>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {enlist.students.map((student, index) => (
                          <tr key={student._id}>
                            {" "}
                            {/* ✅ This key is fine */}
                            <td>{index + 1}</td>
                            <td>{student._id}</td>
                            <td
                              className={styles.studentName}
                              style={{ textAlign: "center" }}
                            >
                              {`${student.LastName ?? ""}, ${
                                student.FirstName ?? ""
                              } ${student.MiddleInitial ?? ""}.`}
                            </td>
                            <td>
                              <button
                                style={{
                                  backgroundColor: "rgb(176, 17, 17)",
                                  cursor: "pointer",
                                  position: "unset",
                                  borderRadius: "5px",
                                }}
                                onClick={() =>
                                  handleDeleteStudent(
                                    student._id,
                                    student.LastName,
                                    student.FirstName,
                                    enlist.subjectId,
                                    enlist.acadYr,
                                    enlist.sem,
                                    enlist.dept,
                                    enlist.sect
                                  )
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </main>
          </div>
        ))}
      </div>

      {showModal2 && (
        <div className={styles.modal2}>
          <div className={styles.modalContent2}>
            <h3>Add Student</h3>

            {loading2 ? (
              <div
                className={styles.modalContent1}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <h4>Loading.. Please Wait</h4>
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
            ) : (
              <>
                <label>Student ID:</label>
                <input
                  type="text"
                  name="studentId"
                  value={studentId}
                  onChange={handleChange}
                  placeholder="Enter Student ID"
                />
                {errors.studentId && (
                  <span className={styles.error}>{errors.studentId}</span>
                )}

                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleChange}
                  placeholder="Enter Last Name"
                />
                {errors.lastName && (
                  <span className={styles.error}>{errors.lastName}</span>
                )}

                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleChange}
                  placeholder="Enter First Name"
                />
                {errors.firstName && (
                  <span className={styles.error}>{errors.firstName}</span>
                )}

                <label>Middle Initial:</label>
                <input
                  type="text"
                  name="middleInitial"
                  value={middleInitial}
                  onChange={handleChange}
                  maxLength={1}
                  placeholder="Enter Middle Initial"
                />
                {errors.middleInitial && (
                  <span className={styles.error}>{errors.middleInitial}</span>
                )}

                <div>
                  <button onClick={closeModal} style={{ marginTop: "10px" }}>
                    Close
                  </button>
                  <button onClick={handleSubmit} style={{ marginTop: "10px" }}>
                    Add
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <EnlismentReport
        isOpen={showModal}
        onCancel={handleCancelSubmit}
        onRefetch={handleFetchEnlist}
      />
    </>
  );
};

export default Enlisment;
