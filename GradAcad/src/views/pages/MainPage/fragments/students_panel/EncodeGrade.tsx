import styles from "./styles/StudentsPanel.module.scss";
import Papa from "papaparse";
import { useCallback, useState, useMemo } from "react";
import { useCombinedData } from "../../../../../hooks/useCombinedData";
import { downloadCSV } from "../../../../../utils/helpers/downloadCSV";
import { calculateEQ } from "../../../../../utils/helpers/calculateEQ";
import { usePopupVisibility } from "../../../../../hooks/usePopupVisibility";
import AreYousure from "../../../../components/AreYouSure";
import SwitchPanel from "../../../../components/SwitchPanel";
import { SubjectData } from "../../../../../models/types/SubjectData";
import { GradingReference } from "../../../../components/EqScale";

interface DataProps {
  dept: string;
  section: string;
  subjectCode: string;
  subjectName: string;
  term: string[];
}

interface EncodeGradeProps {
  onSubjectClick: () => void;
  onStudentClick: (data: SubjectData[], nextPanel: string) => void;
  data: any;
}

const EncodeGrade = ({
  onSubjectClick,
  data,
  onStudentClick,
}: EncodeGradeProps) => {
  const { subjectCode, subjectName, dept, section, term }: DataProps = data;
  const [selectedTerm, setSelectedTerm] = useState<string>(term[0]);

  const terms = useMemo(() => [selectedTerm], [selectedTerm]);

  const {
    combinedData,
    setCombinedData,
    handleInputChange,
    errorMessage,
    loading,
    students,
  } = useCombinedData({
    dept,
    sect: section,
    subjCode: subjectCode,
    terms,
  });
  const { isPopupVisible, openPopup, closePopup } = usePopupVisibility();
  const [switchPanel, setSwitchPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openSwitch = () => setSwitchPanel(true);
  const closeSwitch = () => setSwitchPanel(false);

  const handleTermChange = (term: string) => {
    setSelectedTerm(term);
  };

  const handleGoToGradeSheet = () => {
    onStudentClick([data], "gradesheet");
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
        const uploadedData = result.data;

        // Expected headers: STUDENT_ID, STUDENT NAME, and the specific term (e.g., PRELIM, MIDTERM, FINAL)
        const expectedHeaders = ["STUDENT_ID", "STUDENT NAME", term[0]]; // term[0] is the current term (e.g., PRELIM)

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
        const updatedTableData = combinedData.map((row) => {
          const matchingRow: any = uploadedData.find(
            (uploadedRow: any) => uploadedRow["STUDENT_ID"] === row.StudentId
          );

          const validateGrade = (grade: number) =>
            !isNaN(grade) && grade >= 0 && grade <= 100;

          // Update the specific term grade
          const updatedTerms = {
            ...row.terms,
            [term[0]]:
              isTermName(term[0]) &&
              validateGrade(parseFloat(matchingRow?.[term[0]]))
                ? parseFloat(matchingRow[term[0]])
                : row.terms[term[0] as TermName],
          };

          return {
            ...row,
            terms: updatedTerms, // Update the terms object
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
            onClick={() => downloadCSV(students, term)}
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

                    // const hasNoGrades =
                    //   isTermName(selectedTerm) && !row.terms?.[selectedTerm];

                    const gradeEq = calculateEQ(gradeForSelectedTerm ?? 0);
                    const isFailed = gradeEq > 3.0;
                    const remarks = gradeEq === 5.0 ? "FAILED" : "PASSED";
                    const formattedGrade = gradeEq.toFixed(2);

                    return (
                      <tr
                        key={row.StudentId}
                        className={
                          !gradeForSelectedTerm ? styles.missingGrades : ""
                        }
                      >
                        <td>{row.StudentId}</td>
                        <td className={styles.studentName}>
                          {`${row.LastName ?? ""}, ${row.FirstName ?? ""} ${
                            row.MiddleInitial ?? ""
                          }.`}
                        </td>
                        <td>
                          {isTermName(selectedTerm) &&
                            renderInput(
                              gradeForSelectedTerm,
                              selectedTerm,
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
          <button onClick={openSwitch}>
            <p>Switch Panel</p>
          </button>
          <button onClick={openPopup}>
            <p>Grading Reference</p>
          </button>
        </footer>
      </main>
      <GradingReference isVisible={isPopupVisible} onClose={closePopup} />
      <AreYousure
        isOpen={showModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
      <SwitchPanel
        isVisible={switchPanel}
        onClose={closeSwitch}
        onTermChange={handleTermChange}
        onGoToGradeSheet={handleGoToGradeSheet}
        currentTerm={selectedTerm}
      />
    </>
  );
};

export default EncodeGrade;
