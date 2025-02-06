import styles from "./styles/StudentsPanel.module.scss";
import Papa from "papaparse";
import EqScale from "./EqScale";
import { useCallback, useState } from "react";
import { Props } from "../../../../../models/types/Props";
import { useStudentList } from "../../../../../hooks/useStudentList";
// import { useCombinedData } from "../../../../../hooks/useCombinedData";
import { useCombinedData } from "../../../../../hooks/useCombinedDataCopy";
import { downloadCSV } from "../../../../../utils/helpers/downloadCSV";
import { calculateEQ } from "../../../../../utils/helpers/calculateEQ";
import { usePopupVisibility } from "../../../../../hooks/usePopupVisibility";
import AreYousure from "../../../../components/AreYouSure";

const EncodeGradeCopy = ({ onSubjectClick, data, LoggeduserName }: Props) => {
  const { subjectCode, subjectName, dept, section, term } = data;
  const studentList = useStudentList(LoggeduserName);
  const {
    combinedData,
    handleInputChange,
    setCombinedData,
    errorMessage,
    loading,
  } = useCombinedData(dept, section);
  const { isPopupVisible, openPopup, closePopup } = usePopupVisibility();
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
        const uploadedData = result.data;
        const expectedHeaders = ["STUDENT_ID", "PRELIM", "MIDTERM", "FINAL"];

        // Validate headers
        const parsedHeaders = Object.keys(uploadedData[0] || {});
        const missingHeaders = expectedHeaders.filter(
          (header) => !parsedHeaders.includes(header)
        );

        if (missingHeaders.length) {
          alert(`Missing headers in CSV: ${missingHeaders.join(", ")}`);
          return;
        }

        // Map uploaded data to existing student list
        const updatedTableData = studentList.map((row) => {
          const matchingRow: any = uploadedData.find(
            (uploadedRow: any) => uploadedRow["STUDENT_ID"] === row.studentId
          );

          const validateGrade = (grade: number) =>
            !isNaN(grade) && grade >= 0 && grade <= 100;

          return {
            ...row,
            prelim: validateGrade(parseFloat(matchingRow?.["PRELIM"]))
              ? parseFloat(matchingRow["PRELIM"])
              : row.prelim,
            midterm: validateGrade(parseFloat(matchingRow?.["MIDTERM"]))
              ? parseFloat(matchingRow["MIDTERM"])
              : row.midterm,
            final: validateGrade(parseFloat(matchingRow?.["FINAL"]))
              ? parseFloat(matchingRow["FINAL"])
              : row.final,
          };
        });

        setCombinedData(updatedTableData);
        setIsEditing(true);
      },
      error: (err) => {
        alert("Failed to parse CSV file. Please check the format.");
        console.error("Error parsing CSV:", err);
      },
    });
  };

  const toggleMode = () => {
    if (isEditing) {
      setShowModal(true); // Open modal before saving
    } else {
      setIsEditing(true);
    }
  };

  const handleConfirmSave = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  const handleCancelSave = () => {
    setShowModal(false);
  };

  // Utility function outside the component
  const renderInput = useCallback(
    (
      fieldValue: number | undefined,
      fieldName: any,
      max: number,
      step: number,
      index: number,
      isEditing: boolean
    ) => (
      <input
        type="number"
        step={step}
        max={max}
        value={fieldValue ?? ""}
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

  return (
    <>
      <div className={styles.preloader}>
        <p>Subject &gt; Section </p>
        <p>First Semester A.Y. 2023-2024</p>
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
            COURSE & SECTION : {dept} - {section}
          </p>
        </div>

        <div className={styles.div3}>
          <button
            className={styles.button1}
            onClick={() => downloadCSV(studentList)}
          >
            <img src="src\assets\icons\download_icon.png" alt="" width={20} />
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
            <img src="src\assets\icons\upload_icon.png" alt="" width={20} />
            <p>Upload Grade</p>
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <section>
          <div className={styles.StudentList}>
            {loading && <p className={styles.loading}>Loading data...</p>}
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
                      <h5>{term}</h5>
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
                    const prelim = row.prelim ?? 0;
                    const gradeEq = calculateEQ(prelim);
                    const isFailed = gradeEq > 3.0;
                    const remarks = gradeEq === 5.0 ? "FAILED" : "PASSED";
                    const formattedGrade = gradeEq.toFixed(2);

                    return (
                      <tr key={row.StudentId}>
                        <td>{row.StudentId}</td>
                        <td className={styles.studentName}>
                          {`${row.LastName}, ${row.FirstName} ${row.MiddleInitial}`}
                        </td>
                        <td>
                          {renderInput(
                            row.prelim,
                            "prelim",
                            100.0,
                            0.01,
                            index,
                            isEditing
                          )}
                        </td>
                        <td>{formattedGrade}</td>
                        <td className={isFailed ? styles.fail : ""}>
                          {remarks}
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
          <div onClick={toggleMode}>
            <span>{isEditing ? "Save" : "Edit"}</span>
          </div>
          <button onClick={openPopup}>
            <p>Grading Reference</p>
          </button>
        </footer>
      </main>
      <EqScale isVisible={isPopupVisible} onClose={closePopup}>
        <h2>GRADING SYSTEM</h2>
        <h4>
          The Norzagaray College {"A.Y. 2023 - 2024"} utilizes the grading
          system below:
        </h4>
        <h5>RAW SCORE COMPUTATION</h5>
        <p>
          Class Performance {"(60%)"} + Major Exam {"(30%)"} + Attendance{" "}
          {"(10%)"} = 100
        </p>
        <table>
          <thead>
            <tr>
              <th>RAW SCORE</th>
              <th>GRADE EQUIVALENT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>97 - 100</td>
              <td>1.00</td>
            </tr>
            <tr>
              <td>94 - 96</td>
              <td>1.25</td>
            </tr>
            <tr>
              <td>91 - 93</td>
              <td>1.50</td>
            </tr>
            <tr>
              <td>88 - 90</td>
              <td>1.75</td>
            </tr>
            <tr>
              <td>85 - 87</td>
              <td>2.00</td>
            </tr>
            <tr>
              <td>82 - 84</td>
              <td>2.25</td>
            </tr>
            <tr>
              <td>79 - 81</td>
              <td>2.50</td>
            </tr>
            <tr>
              <td>76 - 78</td>
              <td>2.75</td>
            </tr>
            <tr>
              <td>75</td>
              <td>3.00</td>
            </tr>
            <tr>
              <td>below 75</td>
              <td>5.00</td>
            </tr>
            <tr>
              <td>AW</td>
              <td>Authorized Withdrawal</td>
            </tr>
            <tr>
              <td>UW</td>
              <td>Unauthorized Withdrawal</td>
            </tr>
            <tr>
              <td>NCA</td>
              <td>No Credit Due to Absences</td>
            </tr>
            <tr>
              <td>INC</td>
              <td>Incomplete</td>
            </tr>
          </tbody>
        </table>
      </EqScale>
      <AreYousure
        isOpen={showModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </>
  );
};

export default EncodeGradeCopy;
