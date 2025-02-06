import styles from "./styles/StudentsPanel.module.scss";
import { Props } from "../../../../../models/types/Props";
import { useCombinedData } from "../../../../../hooks/useCombinedData";
import { calculateEQ } from "../../../../../utils/helpers/calculateEQ";
import { getRemarks } from "../../../../../utils/helpers/getRemarks";

const GradeSheet = ({ data, onSubjectClick }: Props) => {
  const { subjectCode, subjectName, dept, section } = data;
  const { combinedData } = useCombinedData();

  const calculateAverage = (prelim: number, midterm: number, final: number) => {
    return (prelim + midterm + final) / 3 || 0;
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
          <button className={styles.button1}>
            <span className={styles.exportIcon}>export_notes</span>
            <p>EXPORT TO EXCEL</p>
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
              // onChange={handleFileUpload}
            />
            <span className={styles.printIcon}>print</span>
            <p>PRINT</p>
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
                    <h5>STUDENT ID</h5>
                  </th>
                  <th>
                    <h5>STUDENT NAME</h5>
                  </th>
                  <th>
                    <h5>PRELIM</h5>
                  </th>
                  <th>
                    <h5>MIDTERM</h5>
                  </th>
                  <th>
                    <h5>FINAL</h5>
                  </th>
                  <th>
                    <h5>AVERAGE</h5>
                  </th>
                  <th>
                    <h5>FG</h5>
                  </th>
                  <th>
                    <h5>REMARKS</h5>
                  </th>
                </tr>
              </thead>
              <tbody>
                {combinedData.map((row, index) => {
                  const average = calculateAverage(
                    row.prelim ?? 0,
                    row.midterm ?? 0,
                    row.final ?? 0
                  );
                  const fg = calculateEQ(average);
                  const remarks = getRemarks(
                    row.prelim ?? 0,
                    row.midterm ?? 0,
                    row.final ?? 0,
                    fg
                  );
                  const isFailed = fg > 3.0;

                  return (
                    <tr key={index}>
                      <td>{row.studentId}</td>
                      <td className={styles.studentName}>
                        {`${row.studentName.lastName}, ${row.studentName.firstName} ${row.studentName.middleInitial}`}
                      </td>
                      <td>{row.prelim}</td>
                      <td>{row.midterm}</td>
                      <td>{row.final}</td>
                      <td>{average.toFixed(2)}</td>
                      <td>{fg}</td>
                      <td className={isFailed ? styles.fail : ""}>{remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
};

export default GradeSheet;
