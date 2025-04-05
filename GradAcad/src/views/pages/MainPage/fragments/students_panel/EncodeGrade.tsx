import styles from "./styles/StudentsPanel.module.scss";
import Papa from "papaparse";
import { useCallback, useState, useMemo, useEffect, useContext } from "react";
import {
  useCombinedDatav2,
  useCombinedDatav2ForExport,
} from "../../../../../hooks/useCombinedData";
import { downloadCSV } from "../../../../../utils/helpers/downloadCSV";
import { calculateEQ } from "../../../../../utils/helpers/calculateEQ";
import { usePopupVisibility } from "../../../../../hooks/usePopupVisibility";
import { SubjectData } from "../../../../../models/types/SubjectData";
import { GradingReference } from "../../../../components/EqScale";
import { API } from "@/context/axiosInstance";
import { DataProps } from "../../../../../models/types/StudentData";
import loadingAnimation from "../../../../../assets/webM/loading.webm";
import loadingHorizontal from "../../../../../assets/webM/loadingHorizontal.webm";
import dropdownIcon from "../../../../../assets/icons/dropdown_icon.png";
import ExportExcel from "../../../../../utils/ExportExcel";
import { UserContext } from "../../../../../context/UserContext";
import { useTerm } from "../../../../../hooks/useTerm";
import pencilIcon from "../../../../../assets/icons/pencil.png";
import saveIcon from "../../.././../../assets/icons/diskette.png";

interface EncodeGradeProps {
  onSubjectClick: () => void;
  onStudentClick: (data: SubjectData[], nextPanel: string) => void;
  data: any;
}

const EncodeGrade = ({ onSubjectClick, data }: EncodeGradeProps) => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;

  const {
    subjectCode,
    subjectName,
    dept,
    section,
    term,
    acadYr,
    sem,
  }: DataProps = data;
  const [selectedTerm, setSelectedTerm] = useState<string>(term[0]);
  const [isSaved, setIsSaved] = useState(false);
  const [isOpenRequest, setIsOpenRequest] = useState(false);

  const terms = useMemo(() => [selectedTerm], [selectedTerm]);

  const {
    combinedData,
    setCombinedData,
    handleInputChange,
    setCurrentGrades,
    setOriginalGrades,
    errorMessage,
    loading,
    students,
    currentGrades,
    originalGrades,
  } = useCombinedDatav2({
    dept,
    acadYr,
    sem,
    sect: section,
    subjCode: subjectCode,
    terms,
  });

  const {
    combinedDataForXport,
    loadingXport,
    errorMessageXport,
    setLoadingXport,
  } = useCombinedDatav2ForExport({
    dept,
    acadYr,
    sem,
    sect: section,
    subjCode: subjectCode,
    terms,
  });

  const {
    activeSems,
    activeAcadYrs,
    activeTerms,
    donePrelim,
    doneMidterm,
    doneFinal,
  } = useTerm();

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTerm(e.target.value);
  };

  const { isPopupVisible, openPopup, closePopup } = usePopupVisibility();
  const [isEditing, setIsEditing] = useState(false);

  const [editingRows, setEditingRows] = useState<Record<string, boolean>>({});
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const [isUpdatingRemarks, setIsUpdatingRemarks] = useState<
    Record<string, boolean>
  >({});

  const editingCount = Object.values(editingRows).filter(Boolean).length;

  const toggleEdit = (studentId: string) => {
    setEditingRows((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  type TermName = "PRELIM" | "MIDTERM" | "FINAL";

  function isTermName(term: string): term is TermName {
    return ["PRELIM", "MIDTERM", "FINAL"].includes(term);
  }

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith(".csv")) {
      alert("Please upload a valid CSV file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const uploadedData = result.data as Array<{ STUDENT_ID: string }>;

        const expectedHeaders = ["STUDENT_ID", "STUDENT NAME", selectedTerm];

        const parsedHeaders = Object.keys(uploadedData[0] || {});
        const missingHeaders = expectedHeaders.filter(
          (header) => !parsedHeaders.includes(header)
        );

        if (missingHeaders.length) {
          alert(`Missing headers in CSV: ${missingHeaders.join(", ")}`);
          return;
        }

        const updatedTableData = combinedData.map((row) => {
          const matchingRow: any = uploadedData.find(
            (uploadedRow: any) => uploadedRow["STUDENT_ID"] === row.StudentId
          );

          // Define conditions for read-only students
          const isMidtermLocked =
            selectedTerm === "MIDTERM" && row.prelimRemarks;
          const isFinalLocked =
            selectedTerm === "FINAL" &&
            (row.prelimRemarks || row.midtermRemarks || row.finalRemarks);
          const isReadOnly = isTermDone || isMidtermLocked || isFinalLocked;

          // If the student is read-only, return the row without updating
          if (isReadOnly) {
            return row;
          }

          const validateGrade = (grade: number) =>
            !isNaN(grade) && grade >= 0 && grade <= 100;

          const updatedGrade = matchingRow?.[selectedTerm]
            ? parseFloat(matchingRow[selectedTerm])
            : row.terms[selectedTerm as keyof typeof row.terms];

          return {
            ...row,
            terms: {
              ...row.terms,
              [selectedTerm]: validateGrade(updatedGrade ?? 0)
                ? updatedGrade ?? 0
                : row.terms[selectedTerm as keyof typeof row.terms] ?? 0,
            },
          };
        });

        setCombinedData(updatedTableData);

        // ✅ Track students as "edited"
        const newEditingRows = uploadedData.reduce((acc, row) => {
          acc[row["STUDENT_ID"]] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setEditingRows(newEditingRows);

        // ✅ Immediately update `currentGrades` for Save All
        const updatedGrades = updatedTableData.reduce((acc, row) => {
          acc[row.StudentId] =
            row.terms[selectedTerm as keyof typeof row.terms] ?? 0;
          return acc;
        }, {} as Record<string, number>);

        setCurrentGrades(updatedGrades);
        setIsEditing(true);
      },
      error: (err) => {
        alert("Failed to parse CSV file. Please check the format.");
        console.error("Error parsing CSV:", err);
      },
    });
  };

  const changedStudents = Object.keys(currentGrades).filter(
    (studentId) => currentGrades[studentId] !== originalGrades[studentId]
  );

  const handleConfirmSave = async (studentId: string) => {
    setLoadingRows((prev) => ({ ...prev, [studentId]: true })); // Start loading

    if (!changedStudents.includes(studentId)) {
      setEditingRows((prev) => ({ ...prev, [studentId]: false }));
      setLoadingRows((prev) => ({ ...prev, [studentId]: false })); // Stop loading
      console.log("No changes for Student:", studentId);
      return;
    }

    const update = {
      SubjectId: subjectCode,
      StudentId: studentId,
      term: selectedTerm,
      grade: currentGrades[studentId],
    };

    try {
      const response = await API.put("/grade/updateGradeV2", {
        updates: [update],
      });

      if (response.status === 200) {
        // ✅ Store previous grade for logging
        const oldGrade = originalGrades[studentId] ?? "N/A";
        const newGrade = currentGrades[studentId];

        // ✅ Update UI state
        setEditingRows((prev) => ({ ...prev, [studentId]: false }));
        setOriginalGrades((prev) => ({
          ...prev,
          [studentId]: newGrade,
        }));

        // ✅ Insert log for grade update
        await API.post("/user/logs", {
          action: "Grade Updated",
          userId: user?.refId, // Instructor's ID
          name: `Prof ${user?.name}`, // Instructor's Name
          date: new Date().toLocaleString(),
          details: `Updated grade for Student ${studentId} in ${subjectCode} (${selectedTerm}): ${oldGrade} --> ${newGrade}.`,
        });

        console.log(`Grade updated successfully for Student ${studentId}`);
      } else {
        console.error("Failed to update grade for Student:", studentId);
      }
    } catch (error) {
      console.error("Error updating grade:", error);
    } finally {
      setTimeout(() => {
        setLoadingRows((prev) => ({ ...prev, [studentId]: false }));
      }, 1000);
    }
  };

  const handleSaveAll = async () => {
    // Get all students currently being edited
    const studentsToSave = Object.keys(editingRows).filter(
      (studentId) => editingRows[studentId]
    );

    if (studentsToSave.length === 0) return;

    // Check for students with actual changes
    const studentsWithChanges = studentsToSave.filter(
      (studentId) => currentGrades[studentId] !== originalGrades[studentId]
    );

    if (studentsWithChanges.length === 0) {
      alert("No changes detected for any students.");
      setEditingRows({});
      return;
    }

    // ✅ Set loading state for all modified students
    const loadingState = studentsWithChanges.reduce(
      (acc, id) => ({ ...acc, [id]: true }),
      {}
    );
    setLoadingRows((prev) => ({ ...prev, ...loadingState }));

    // ✅ Prepare updates for API request
    const updates = studentsWithChanges.map((studentId) => ({
      SubjectId: subjectCode,
      StudentId: studentId,
      term: selectedTerm,
      grade: currentGrades[studentId],
    }));

    try {
      const response = await API.put("/grade/updateGradeV2", { updates });

      if (response.status === 200) {
        // ✅ Update UI & Remove students from edit mode
        const updatedOriginalGrades = { ...originalGrades };
        studentsWithChanges.forEach((studentId) => {
          updatedOriginalGrades[studentId] = currentGrades[studentId];
        });

        setEditingRows({});
        setOriginalGrades(updatedOriginalGrades);

        // ✅ Insert log for bulk update
        await API.post("/user/logs", {
          action: "Bulk Grade Update",
          userId: user?.refId,
          name: `Prof ${user?.name}`,
          date: new Date().toLocaleString(),
          details: `Updated grades for ${studentsWithChanges.length} students in ${subjectCode} (${selectedTerm}).`,
        });

        console.log(
          `Updated grades for ${studentsWithChanges.length} students.`
        );
      } else {
        console.error("Failed to save grades for multiple students.");
      }
    } catch (error) {
      console.error("Error saving grades:", error);
    } finally {
      // ✅ Stop loading state after 3s
      setTimeout(() => {
        setLoadingRows((prev) => {
          const newState = { ...prev };
          studentsWithChanges.forEach((id) => (newState[id] = false));
          return newState;
        });
      }, 3000);
    }
  };

  const handleRemarksChange = async (
    event: any,
    selectedTerm: string,
    studentId: string,
    subjectId: string,
    setIsUpdating: React.Dispatch<
      React.SetStateAction<Record<string, boolean>>
    >,
    setCombinedData: React.Dispatch<React.SetStateAction<any[]>> // ✅ Accept setCombinedData
  ) => {
    const newRemarks = event.target.value;

    // ✅ Set only the specific student's loading state
    setIsUpdating((prev) => ({ ...prev, [studentId]: true }));

    try {
      const response = await fetch("/grade/updateRemarks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTerm,
          studentId,
          subjectId,
          remarks: newRemarks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Remarks updated successfully");

        // ✅ Update the combinedData state
        setCombinedData((prevData) =>
          prevData.map((row) =>
            row.StudentId === studentId
              ? {
                  ...row,
                  [`${selectedTerm.toLowerCase()}Remarks`]: newRemarks, // ✅ Update correct term's remarks
                }
              : row
          )
        );
      } else {
        console.error("Failed to update remarks:", data.message);
      }
    } catch (error) {
      console.error("Error updating remarks:", error);
    } finally {
      setTimeout(() => {
        setIsUpdating((prev) => ({ ...prev, [studentId]: false }));
      }, 2000);
    }
  };

  const renderInput = useCallback(
    (
      fieldValue: number | undefined,
      fieldName: string,
      max: number,
      step: number,
      index: number,
      isEditing: boolean
    ) => (
      <input
        type="number"
        step={step}
        max={max}
        value={fieldValue !== undefined ? fieldValue : ""}
        readOnly={!isEditing}
        onKeyDown={(e) => {
          if (["e", "E", "+", "-"].includes(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          let value =
            e.target.value === "" ? undefined : parseFloat(e.target.value);

          if (value !== undefined) {
            value = Math.min(max, Math.max(0, value));
          }

          handleInputChange(index, fieldName, value);
        }}
        aria-label={`Input for ${fieldName}`}
      />
    ),
    [handleInputChange]
  );

  // Check if the selected term is done
  const isTermDone =
    (selectedTerm === "PRELIM" && donePrelim) ||
    (selectedTerm === "MIDTERM" && doneMidterm) ||
    (selectedTerm === "FINAL" && doneFinal);

  const isOngoingSubject =
    acadYr && sem
      ? activeAcadYrs.includes(acadYr) && activeSems.includes(sem)
      : false;

  useEffect(() => {
    if (combinedData.length > 0 && isEditing) {
      const initialGrades = combinedData.reduce((acc, row) => {
        const grade = row.terms?.[selectedTerm as keyof typeof row.terms] ?? 0;
        acc[row.StudentId] = grade;
        return acc;
      }, {} as Record<string, number>);

      setCurrentGrades(initialGrades);

      if (changedStudents.length === 0) {
        setOriginalGrades(initialGrades);
      }

      console.log("Updated Original Grades:", originalGrades);
      console.log("Updated Current Grades:", currentGrades);
    }
  }, [combinedData, selectedTerm, isEditing]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await API.post(
          "/grade/fetchAllRequestById",
          { refId: user?.refId } // Send refId in request body
        );

        if (response.data.success) {
          const activeRequests = response.data.data.filter(
            (item: any) => item.isActive === true
          );

          const matchFound = activeRequests.some((item: any) => {
            return (
              item.subjectId === subjectCode &&
              item.dept === dept &&
              item.sect === section &&
              item.term === selectedTerm &&
              item.acadYr === acadYr &&
              item.sem === sem
            );
          });

          setIsOpenRequest(matchFound);
        } else {
          setIsOpenRequest(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsOpenRequest(false);
      }
    };

    fetchRequests();
  }, [user?.refId, subjectCode, dept, section, terms, acadYr, sem]);

  return (
    <>
      <div className={styles.preloader}>
        <p>Subject &gt; Section </p>
        <p>
          <strong>
            {sem} Semester A.Y. {acadYr}
          </strong>
        </p>
      </div>
      <header className={styles.headerStudentsPanel}>
        <div className={styles.div1}>
          <button onClick={onSubjectClick}>
            <img src="src\assets\icons\backButton.png" alt="Back" width={35} />
          </button>
          <h3>
            {subjectCode} - {subjectName}
          </h3>
        </div>

        <div className={styles.div2}>
          <p>
            COURSE & SECTION :{" "}
            <strong>
              {dept} - {section}
            </strong>
          </p>

          <p>
            TERM :
            <strong>
              <select
                id="term"
                value={selectedTerm}
                onChange={handleTermChange}
                className={styles.selectHidden}
              >
                {!isOngoingSubject ? (
                  <>
                    <option value="PRELIM">PRELIM</option>
                    <option value="MIDTERM">MIDTERM</option>
                    <option value="FINAL">FINAL</option>
                  </>
                ) : (
                  ["PRELIM", "MIDTERM", "FINAL"].map((term) =>
                    activeTerms.includes(term.toLowerCase()) ? (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ) : null
                  )
                )}
              </select>

              <img
                src={dropdownIcon}
                alt="select a term"
                height={10}
                width={10}
              />
            </strong>
          </p>
        </div>

        {!isTermDone && isOngoingSubject && (
          <div className={styles.div3}>
            <button
              className={styles.button1}
              onClick={() => downloadCSV(students, selectedTerm, data)}
            >
              <img src="src/assets/icons/download_icon.png" alt="" width={20} />
              <p>Download Grade Template</p>
            </button>
            <button
              className={styles.button2}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <input
                type="file"
                accept=".csv"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <img src="src/assets/icons/upload_icon.png" alt="" width={20} />
              <p>Upload Grade</p>
            </button>
          </div>
        )}
        {isOpenRequest && (
          <div className={styles.div3}>
            <button
              className={styles.button1}
              onClick={() => downloadCSV(students, selectedTerm, data)}
            >
              <img src="src/assets/icons/download_icon.png" alt="" width={20} />
              <p>Download Grade Template</p>
            </button>
            <button
              className={styles.button2}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <input
                type="file"
                accept=".csv"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <img src="src/assets/icons/upload_icon.png" alt="" width={20} />
              <p>Upload Grade</p>
            </button>
          </div>
        )}
      </header>
      <main className={styles.main}>
        <section>
          <div className={styles.StudentList}>
            {loading && (
              <div className={styles.loading}>
                <h2>Loading.. Please Wait</h2>
                <video
                  autoPlay
                  loop
                  muted
                  className={styles.loadingAnimation}
                  height={100}
                >
                  <source src={loadingAnimation} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            {!loading && !errorMessage && (
              <table>
                <thead>
                  <tr>
                    <th>
                      <h5>STUDENT ID</h5>
                    </th>
                    <th>
                      <h5>STUDENT NAME</h5>
                    </th>
                    <th>
                      <h5>{selectedTerm}</h5>
                    </th>
                    <th>
                      <h5>GRADE EQ</h5>
                    </th>
                    <th>
                      <h5>REMARKS</h5>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {combinedData.map((row, index) => {
                    const gradeForSelectedTerm = isTermName(selectedTerm)
                      ? row.terms?.[selectedTerm]
                      : undefined;

                    const gradeEq = calculateEQ(gradeForSelectedTerm ?? 0);
                    const isFailed = gradeEq > 3.0;
                    const computedRemarks =
                      gradeEq === 5.0 ? "FAILED" : "PASSED";
                    const formattedGrade = gradeEq.toFixed(2);

                    const prelimRemarks =
                      row.prelimRemarks && row.prelimRemarks.trim() !== "";

                    const midtermRemarks =
                      row.midtermRemarks && row.midtermRemarks.trim() !== "";

                    const finalRemarks =
                      row.finalRemarks && row.finalRemarks.trim() !== "";

                    const remarks =
                      selectedTerm === "PRELIM" && prelimRemarks
                        ? row.prelimRemarks
                        : selectedTerm === "MIDTERM" && prelimRemarks
                        ? row.prelimRemarks
                        : selectedTerm === "MIDTERM" && midtermRemarks
                        ? row.midtermRemarks
                        : selectedTerm === "FINAL" && prelimRemarks
                        ? row.prelimRemarks
                        : selectedTerm === "FINAL" && midtermRemarks
                        ? row.midtermRemarks
                        : selectedTerm === "FINAL" && finalRemarks
                        ? row.finalRemarks
                        : computedRemarks;

                    const isMidtermLocked =
                      selectedTerm === "MIDTERM" && prelimRemarks;
                    const isFinalLocked =
                      selectedTerm === "FINAL" &&
                      (midtermRemarks || prelimRemarks);

                    // ✅ Allow PRELIM editing until it's marked as done
                    const isReadOnly =
                      isTermDone || // Lock PRELIM only when done
                      isMidtermLocked ||
                      isFinalLocked;

                    const shouldShowDropdown =
                      gradeForSelectedTerm == null || gradeForSelectedTerm < 65;
                    const shouldShowFailedRemarks =
                      gradeForSelectedTerm ||
                      (0 >= 66 && gradeForSelectedTerm) ||
                      0 <= 74;

                    return (
                      <tr
                        key={row.StudentId}
                        className={
                          !gradeForSelectedTerm && isSaved
                            ? styles.missingGrades
                            : ""
                        }
                      >
                        <td>{row.StudentId}</td>
                        <td>{`${row.LastName ?? ""}, ${row.FirstName ?? ""} ${
                          row.MiddleInitial ?? ""
                        }.`}</td>
                        <td
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {isTermName(selectedTerm) &&
                            renderInput(
                              gradeForSelectedTerm,
                              selectedTerm,
                              100.0,
                              0.01,
                              index,
                              editingRows[row.StudentId] || false
                            )}

                          {loadingRows[row.StudentId] ? (
                            <video
                              autoPlay
                              loop
                              muted
                              className={styles.loadingAnimation}
                              width={80}
                            >
                              <source
                                src={loadingAnimation}
                                type="video/webm"
                              />
                              Your browser does not support the video tag.
                            </video>
                          ) : isOpenRequest ? (
                            <img
                              src={
                                editingRows[row.StudentId]
                                  ? saveIcon
                                  : pencilIcon
                              }
                              alt="edit"
                              width={20}
                              height={20}
                              style={{
                                paddingLeft: "15px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                if (!loadingRows[row.StudentId]) {
                                  if (editingRows[row.StudentId]) {
                                    handleConfirmSave(row.StudentId);
                                    setIsSaved(true);
                                  } else {
                                    toggleEdit(row.StudentId);
                                  }
                                }
                              }}
                            />
                          ) : (
                            !isReadOnly &&
                            isOngoingSubject && (
                              <img
                                src={
                                  editingRows[row.StudentId]
                                    ? saveIcon
                                    : pencilIcon
                                }
                                alt="edit"
                                width={20}
                                height={20}
                                style={{
                                  paddingLeft: "15px",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  if (!loadingRows[row.StudentId]) {
                                    if (editingRows[row.StudentId]) {
                                      handleConfirmSave(row.StudentId);
                                      setIsSaved(true);
                                    } else {
                                      toggleEdit(row.StudentId);
                                    }
                                  }
                                }}
                              />
                            )
                          )}
                        </td>
                        <td>{formattedGrade}</td>
                        <td
                          className={isFailed ? styles.fail : ""}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {shouldShowDropdown ? (
                            <>
                              {isOngoingSubject && (
                                <select
                                  style={{ width: "35%", color: "#ff4949" }}
                                  disabled={
                                    isUpdatingRemarks[row.StudentId] ||
                                    isReadOnly ||
                                    false
                                  }
                                  onChange={(e) =>
                                    handleRemarksChange(
                                      e,
                                      selectedTerm,
                                      row.StudentId,
                                      subjectCode,
                                      setIsUpdatingRemarks,
                                      setCombinedData
                                    )
                                  }
                                  value={remarks}
                                >
                                  <option value="">Select</option>
                                  <option value="AW">AW</option>
                                  <option value="UW">UW</option>
                                  <option value="NCA">NCA</option>
                                  <option value="INC">INC</option>
                                </select>
                              )}

                              {isOpenRequest && (
                                <select
                                  style={{ width: "35%", color: "#ff4949" }}
                                  disabled={
                                    isUpdatingRemarks[row.StudentId] || false
                                  }
                                  onChange={(e) =>
                                    handleRemarksChange(
                                      e,
                                      selectedTerm,
                                      row.StudentId,
                                      subjectCode,
                                      setIsUpdatingRemarks,
                                      setCombinedData
                                    )
                                  }
                                  value={remarks}
                                >
                                  <option value="">Select</option>
                                  <option value="AW">AW</option>
                                  <option value="UW">UW</option>
                                  <option value="NCA">NCA</option>
                                  <option value="INC">INC</option>
                                </select>
                              )}

                              {!isOngoingSubject && !isOpenRequest && (
                                <select
                                  style={{ width: "35%", color: "#ff4949" }}
                                  disabled={true}
                                  onChange={(e) =>
                                    handleRemarksChange(
                                      e,
                                      selectedTerm,
                                      row.StudentId,
                                      subjectCode,
                                      setIsUpdatingRemarks,
                                      setCombinedData
                                    )
                                  }
                                  value={remarks}
                                >
                                  <option value="">Select</option>
                                  <option value="AW">AW</option>
                                  <option value="UW">UW</option>
                                  <option value="NCA">NCA</option>
                                  <option value="INC">INC</option>
                                </select>
                              )}

                              {isUpdatingRemarks[row.StudentId] && (
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  className={styles.loadingAnimation}
                                  width={80}
                                >
                                  <source
                                    src={loadingAnimation}
                                    type="video/webm"
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </>
                          ) : shouldShowFailedRemarks ? ( // ✅ Show "FAILED" if grade is between 66-74
                            computedRemarks
                          ) : (
                            remarks // ✅ Default to fetched or computed remarks
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
        <footer>
          {/* Slide-up and Slide-down animation for Save All button */}
          <button
            className={`${styles.saveAllButton} ${
              editingCount > 1 ? styles.slideUp : styles.slideDown
            }`}
            onClick={handleSaveAll}
            disabled={editingCount <= 1}
          >
            <p>Save All</p>
          </button>
          {loadingXport && (
            <div className={styles.loading}>
              <video
                autoPlay
                loop
                muted
                className={styles.loadingAnimation}
                width={60}
              >
                <source src={loadingHorizontal} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {errorMessageXport && (
            <p className={styles.error}>{errorMessageXport}</p>
          )}

          {!loadingXport && !errorMessageXport && (
            <ExportExcel
              combinedData={combinedDataForXport}
              loggedName={user?.name ?? ""}
              dept={dept}
              subjectCode={subjectCode}
              subjectName={subjectName}
              section={section}
              sem={sem ?? ""}
              acadYr={acadYr ?? ""}
              buttonName="Export to Excel"
              isDefault={false}
              setLoadingExporting={setLoadingXport}
            />
          )}
          <button onClick={openPopup} style={{ transition: "all 0.3s ease" }}>
            <p>Grading Reference</p>
          </button>
        </footer>
      </main>
      <GradingReference isVisible={isPopupVisible} onClose={closePopup} />
    </>
  );
};

export default EncodeGrade;
