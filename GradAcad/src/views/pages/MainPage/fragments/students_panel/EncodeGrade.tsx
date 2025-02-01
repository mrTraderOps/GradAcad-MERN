import styles from "./styles/StudentsPanel.module.scss";
import Papa from "papaparse";
import EqScale from "./EqScale";
import { useState } from "react";
import { Props } from "../../../../../models/types/Props";
import { useStudentList } from "../../../../../hooks/useStudentList";
import { useCombinedData } from "../../../../../hooks/useCombinedData";
import { downloadCSV } from "../../../../../utils/helpers/downloadCSV";
import { calculateEQ } from "../../../../../utils/helpers/calculateEQ";
import { newTerm } from "../../../../../utils/helpers/newTerm";
import { getRemarks } from "../../../../../utils/helpers/getRemarks";
import { usePopupVisibility } from "../../../../../hooks/usePopupVisibility";
import SelectCourseSection from "./C_S";

const EncodeGrade = ({ onSubjectClick, data, LoggeduserName }: Props) => {
  
  const studentList = useStudentList(LoggeduserName);
  const { combinedData, handleInputChange, setCombinedData } =
    useCombinedData();
  const { subjectCode, subjectName, dept, section } = data;
  const { isPopupVisible, openPopup, closePopup } = usePopupVisibility();

  const [isEditing, setIsEditing] = useState(true);

  const [termActive, setTermActive] = useState({
    isPrelim: true,
    isDonePrelim: true,
    isMidterm: true,
    isDoneMidterm: false,
    isFinal: true,
    isDoneFinal: false,
  });

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
    setIsEditing((prevState) => !prevState);
  };

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
            <table>
              <thead>
                <tr>
                  <th>
                    <h5>#</h5>
                  </th>
                  <th>
                    <h5>STUDENT ID</h5>
                  </th>
                  <th>
                    <h5>Name</h5>
                  </th>
                  {termActive.isPrelim && (
                    <th>
                      <h5>Prelim</h5>
                    </th>
                  )}
                  {termActive.isMidterm && (
                    <th>
                      <h5>Midterm</h5>
                    </th>
                  )}
                  {termActive.isFinal && (
                    <th>
                      <h5>Final</h5>
                    </th>
                  )}
                  <th>
                    <h5>Average</h5>
                  </th>
                  <th>
                    <h5>Final Grade</h5>
                  </th>
                  <th>
                    <h5>Remarks</h5>
                  </th>
                </tr>
              </thead>
              <tbody>
                {combinedData.map((row, index) => {
                  const average = newTerm(row.prelim, row.midterm, row.final);
                  const fg = calculateEQ(
                    newTerm(row.prelim, row.midterm, row.final)
                  );
                  const isFailed = fg > 3.0;
                  const remarks = getRemarks(
                    row.prelim ?? 0,
                    row.midterm ?? 0,
                    row.final ?? 0,
                    fg
                  );

                  const renderInput = (
                    fieldValue: any,
                    fieldName: any,
                    max: number,
                    step: any,
                    isActive: boolean
                  ) => (
                    <input
                      type="number"
                      step={step}
                      max={max}
                      readOnly={!isActive}
                      value={fieldValue ?? ""}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        let value =
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value);

                        if (value !== undefined) {
                          value = Math.min(max, Math.max(0, value));
                        }

                        handleInputChange(index, fieldName, value);
                      }}
                    />
                  );

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.studentId}</td>
                      <td className={styles.studentName}>
                        {`${row.studentName.lastName}, ${row.studentName.firstName} ${row.studentName.middleInitial}`}
                      </td>
                      {termActive.isPrelim && (
                        <td>
                          {renderInput(
                            row.prelim,
                            "prelim",
                            100.0,
                            0.01,
                            termActive.isPrelim
                          )}
                        </td>
                      )}
                      {termActive.isMidterm && (
                        <td>
                          {renderInput(
                            row.midterm,
                            "midterm",
                            100.0,
                            0.01,
                            termActive.isMidterm
                          )}
                        </td>
                      )}
                      {termActive.isFinal && (
                        <td>
                          {renderInput(
                            row.final,
                            "final",
                            100.0,
                            0.01,
                            termActive.isFinal
                          )}
                        </td>
                      )}
                      <td>{average.toFixed(2)}</td>
                      <td>{fg.toFixed(2)}</td>
                      <td className={isFailed ? styles.fail : ""}>{remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <footer>
          <button onClick={openPopup}>
            <p>Grading Reference</p>
          </button>
          <div onClick={() => toggleMode}>
            <span className={isEditing ? styles.pencilIcon : styles.saveIcon}>
              {isEditing ? "save" : "edit"}
            </span>
          </div>
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
    </>
  );
};

export default EncodeGrade;
