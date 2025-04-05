import { useContext, useEffect, useState } from "react";
import styles from "../styles/UserManagement.module.scss";
import API from "../../../../context/axiosInstance";
import { UserContext } from "../../../../context/UserContext";

interface Subject {
  _id: string;
  subjectId: string;
  instructor: string;
  acadYr: string;
  sem: string;
  dept: string;
  sect: string;
  subjectName?: string;
  profId?: string;
}

interface Prof {
  refId: string;
  name: string;
}

const OfferedSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [archivedSubjects, setArchivedSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [instructors, setInstructors] = useState<Prof[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const context = useContext(UserContext);
  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;

  useEffect(() => {
    if (showArchived) {
      // ✅ Fetch Archived Users
      API.get("/subject/getAllSubjectsArchived")
        .then((response) => {
          if (response.data.success) {
            setArchivedSubjects(response.data.data);
          } else {
            setErrorMessage(
              response.data.message || "No archived subjects found."
            );
          }
        })
        .catch((error) => {
          setErrorMessage(
            error.response?.data?.message || "An error occurred."
          );
        });
    } else {
      const fetchInstructors = async () => {
        try {
          const response = await API.get("/subject/getAllInstructor");
          if (response.data.success) {
            setInstructors(response.data.users); // Store instructor list
          }
        } catch (error) {
          console.error("Error fetching instructors:", error);
        }
      };

      fetchInstructors();
      fetchSubjects();
    }
  }, [showArchived]);

  const fetchSubjects = async () => {
    try {
      const response = await API.get("/subject/getAllSubjectsEnrollment");

      if (response.data.success) {
        setSubjects(response.data.data);
      } else {
        setErrorMessage(response.data.message || "No subjects found.");
      }
    } catch (error) {
      setErrorMessage("An error occurred.");
    }
  };

  const handleArchive = async (_id: string) => {
    if (!window.confirm("Are you sure you want to archive this subject?")) {
      return;
    }

    // ✅ Find user before archive for logs
    const subjectToArchive = subjects.find((subject) => subject._id === _id);
    if (!subjectToArchive) {
      alert("Subject not found.");
      return;
    }

    try {
      const response = await API.post("/subject/archiveSubject", {
        _id,
      });

      if (response.data.success) {
        alert("Subject archive successfully!");

        // ✅ Log Deletion
        await API.post("/user/logs", {
          action: "Subject Archived",
          userId: user?.refId,
          name: user?.name,
          details: `Archived subject: ${subjectToArchive.subjectId} - ${subjectToArchive.dept} ${subjectToArchive.sect} )`,
          date: new Date().toLocaleString(),
        });

        // ✅ Remove from UI
        setSubjects((prevSubject) =>
          prevSubject.filter((subject) => subject._id !== _id)
        );
      } else {
        alert(response.data.message || "Failed to archive subject.");
      }
    } catch (error) {
      console.error("Error archive subject:", error);
      alert("An error occurred while archiving the subject.");
    }
  };

  const handleRestore = async (_id: string) => {
    if (!window.confirm("Are you sure you want to restore this subject?")) {
      return;
    }

    // ✅ Find user before archive for logs
    const subjectToArchive = archivedSubjects.find(
      (subject) => subject._id === _id
    );
    if (!subjectToArchive) {
      alert("Subject not found.");
      return;
    }

    try {
      const response = await API.post("/subject/restoreSubject", {
        _id,
      });

      if (response.data.success) {
        alert("Subject restored successfully!");

        // ✅ Log Deletion
        await API.post("/user/logs", {
          action: "Subject Restored",
          userId: user?.refId,
          name: user?.name,
          details: `Restored subject: ${subjectToArchive.subjectId} - ${subjectToArchive.dept} ${subjectToArchive.sect} )`,
          date: new Date().toLocaleString(),
        });

        // ✅ Remove from UI
        setArchivedSubjects((prevSubject) =>
          prevSubject.filter((subject) => subject._id !== _id)
        );
      } else {
        alert(response.data.message || "Failed to restore subject.");
      }
    } catch (error) {
      console.error("Error restore subject:", error);
      alert("An error occurred while restoring the subject.");
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
  };

  const handleSave = async (editedSubject: Subject) => {
    try {
      console.log(editedSubject._id);
      const response = await API.post(
        "/subject/updateSubjectOffered",
        editedSubject,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        alert("Subject offering updated successfully!");
        fetchSubjects();
        setEditingSubject(null);
        setErrors({});
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(`Error updating subject: ${error}`);
    }
  };

  const validateAcadYr = (value: string) => {
    const acadYrRegex = /^\d{4} - \d{4}$/;
    return acadYrRegex.test(value)
      ? ""
      : "Academic Year must be in YYYY - YYYY format.";
  };

  const validateDept = (value: string) => {
    const deptRegex = /^[A-Z]{4}$/;
    return deptRegex.test(value)
      ? ""
      : "Course must be exactly 4 uppercase letters.";
  };

  const validateSect = (value: string) => {
    const sectRegex = /^[1-4][A-Z]$/;
    return sectRegex.test(value)
      ? ""
      : "Section must be 2 characters: First 1-4, Second A-Z.";
  };

  const validateSubjectId = (value: string) => {
    const pattern = /^[A-Z]+\s\d+$/;
    return pattern.test(value)
      ? ""
      : `Format: UPPERCASE word + space + number (e.g., "MATH 101")`;
  };

  const handleChange = (field: keyof Subject, value: string) => {
    let error = "";

    switch (field) {
      case "acadYr":
        error = validateAcadYr(value);
        break;
      case "dept":
        error = validateDept(value);
        break;
      case "sect":
        error = validateSect(value);
        break;
      case "subjectId":
        error = validateSubjectId(value);
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));

    setEditingSubject((prev) =>
      prev
        ? { ...prev, [field]: value }
        : {
            _id: "",
            subjectId: "",
            profId: "",
            instructor: "",
            acadYr: "",
            sem: "",
            dept: "",
            sect: "",
          }
    );
  };

  return (
    <div className={styles.userManagement}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          paddingBottom: "15px",
        }}
      >
        <h2>{showArchived ? "Archived Subjects" : "Offered Subjects"}</h2>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          {showArchived ? null : (
            <button
              style={{
                borderRadius: "10px",
                backgroundColor: "#0F2A71",
                height: "40px",
              }}
              onClick={() =>
                setEditingSubject({
                  _id: "",
                  subjectId: "",
                  instructor: "",
                  acadYr: "",
                  sem: "",
                  dept: "",
                  sect: "",
                  subjectName: "",
                  profId: "",
                })
              }
            >
              Add Subject
            </button>
          )}
          <button
            style={{
              borderRadius: "10px",
              backgroundColor: "green",
              height: "40px",
            }}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Back to Offered Subjects" : "Archive List"}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search users by subject code, instructor's name, course, or section..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* User Table */}
      <div className={styles.tableContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Instructor</th>
              <th>Academic Year</th>
              <th>Semester</th>
              <th>Course & Section</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {errorMessage && (
              <>
                <h2>{errorMessage}</h2>
              </>
            )}
            {!errorMessage &&
              (showArchived ? archivedSubjects : subjects)
                .filter(
                  (subject) =>
                    (subject.subjectId?.toLowerCase() || "").includes(
                      searchQuery.toLowerCase()
                    ) ||
                    (subject.dept || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    (subject.sect || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    (subject.instructor || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((subject) => (
                  <tr key={subject._id}>
                    <td>{subject.subjectId}</td>
                    <td>{subject.instructor}</td>
                    <td>{subject.acadYr}</td>
                    <td>{subject.sem}</td>
                    <td>{`${subject.dept} ${subject.sect}`}</td>
                    <td>
                      {showArchived ? (
                        <button
                          className={styles.archiveButton}
                          onClick={() => handleRestore(subject._id)}
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            className={styles.editButton}
                            onClick={() => handleEdit(subject)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.archiveButton}
                            onClick={() => handleArchive(subject._id)}
                          >
                            Archive
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {editingSubject && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ width: "40%" }}>
            <h3>Edit Subject</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(editingSubject);
              }}
            >
              <div className={styles.formGroup}>
                <label>Subject Code</label>
                <input
                  type="text"
                  value={editingSubject.subjectId}
                  onChange={(e) => handleChange("subjectId", e.target.value)}
                />
                {errors.subjectId && (
                  <p className={styles.error}>{errors.subjectId}</p>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Subject Name</label>
                <input
                  type="text"
                  value={editingSubject.subjectName}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      subjectName: e.target.value,
                    })
                  }
                />
              </div>
              {/* Instructor Dropdown */}
              <div className={styles.formGroup}>
                <label style={{ marginLeft: "10px" }}>
                  <strong>Instructor: </strong>
                </label>
                <select
                  value={editingSubject?.profId || ""}
                  onChange={(e) =>
                    setEditingSubject({
                      ...editingSubject,
                      profId: e.target.value,
                    })
                  } // Handle selection change
                  style={{
                    height: "59px",
                    width: "68%",
                    marginLeft: "25px",
                    paddingLeft: "10px",
                    fontWeight: "600",
                  }}
                >
                  <option value="" disabled>
                    Select an Instructor
                  </option>

                  {instructors.map((instructor) => (
                    <option key={instructor.refId} value={instructor.refId}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year Input */}
              <div className={styles.formGroup}>
                <label>Academic Year</label>
                <input
                  type="text"
                  value={editingSubject?.acadYr || ""}
                  onChange={(e) => handleChange("acadYr", e.target.value)}
                />
                {errors.acadYr && (
                  <p className={styles.error}>{errors.acadYr}</p>
                )}
              </div>

              {/* Semester Dropdown */}
              <div className={styles.formGroup}>
                <label>Semester</label>
                <select
                  value={editingSubject?.sem || ""}
                  onChange={(e) => handleChange("sem", e.target.value)}
                  style={{
                    height: "59px",
                    width: "68%",
                    marginLeft: "25px",
                    paddingLeft: "10px",
                    fontWeight: "bold",
                  }}
                >
                  <option value="">
                    {editingSubject?.sem || "Select Semester"}
                  </option>
                  {editingSubject?.sem === "First" ? (
                    <option value="Second">Second</option>
                  ) : editingSubject?.sem === "Second" ? (
                    <option value="First">First</option>
                  ) : (
                    <>
                      <option value="First">First</option>
                      <option value="Second">Second</option>
                    </>
                  )}
                </select>
              </div>

              {/* Course Input (4 UPPERCASE LETTERS) */}
              <div className={styles.formGroup}>
                <label>Course</label>
                <input
                  type="text"
                  value={editingSubject?.dept || ""}
                  onChange={(e) =>
                    handleChange("dept", e.target.value.toUpperCase())
                  }
                />
                {errors.dept && <p className={styles.error}>{errors.dept}</p>}
              </div>

              {/* Section Input (1-4 + A-Z) */}
              <div className={styles.formGroup}>
                <label>Section</label>
                <input
                  type="text"
                  value={editingSubject?.sect || ""}
                  onChange={(e) =>
                    handleChange("sect", e.target.value.toUpperCase())
                  }
                />
                {errors.sect && <p className={styles.error}>{errors.sect}</p>}
              </div>

              <div className={styles.modalActions}>
                <button type="submit">Save</button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubject(null);
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferedSubjects;
