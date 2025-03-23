import styles from "../fragments/students_panel/styles/StudentsPanel.module.scss";
import style from "../styles/Department.module.scss";
import { useContext, useMemo } from "react";
import { UserContext } from "../../../../context/UserContext";
import {
  useCombinedDatav2,
  useCombinedDatav2ForExport,
} from "../../../../hooks/useCombinedData";
import ExportExcel from "../../../../utils/ExportExcel";
import { calculateAverage } from "../../../../utils/helpers/calculateAve";
import { calculateEQ } from "../../../../utils/helpers/calculateEQ";
import { getRemarks } from "../../../../utils/helpers/getRemarks";
import { useNavigate } from "react-router-dom";
import loadingHorizontal from "../../../../assets/webM/loadingHorizontal.webm";
const ReportSheet = () => {
  const context = useContext(UserContext);
  const nav = useNavigate();

  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user, confirmData } = context;

  const { subjCode, subjName, dept, sect, acadYr, sem } = confirmData[0];

  const requestParams = useMemo(
    () => ({
      acadYr,
      sem,
      dept,
      sect,
      subjCode,
      terms: [""],
    }),
    [acadYr, sem, dept, sect, subjCode]
  );

  const { combinedData, errorMessage, loading } =
    useCombinedDatav2(requestParams);

  const {
    combinedDataForXport,
    loadingXport,
    errorMessageXport,
    setLoadingXport,
  } = useCombinedDatav2ForExport(requestParams);

  return (
    <>
      <div className={style.department}>
        <div className={styles.preloader}>
          <p>Subject &gt; Section </p>
          <p>
            {sem} Semester A.Y. {acadYr}
          </p>
        </div>
        <header className={styles.headerStudentsPanel}>
          <div className={styles.div1}>
            <button onClick={() => nav("/dashboard")}>
              <img
                src="src\assets\icons\backButton.png"
                alt="Back"
                width={35}
              />
            </button>
            <h3>
              {subjCode} - {subjName}
            </h3>
          </div>

          <div className={styles.div2}>
            <p>
              COURSE & SECTION :{" "}
              <strong>
                {dept} - {sect}
              </strong>
            </p>
          </div>

          <div className={styles.div3}>
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
                subjectCode={subjCode}
                subjectName={subjName}
                section={sect}
                sem={sem}
                acadYr={acadYr}
                setLoadingExporting={setLoadingXport}
              />
            )}
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
                        <h5>GRADE EQ</h5>
                      </th>
                      <th>
                        <h5>REMARKS</h5>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedData.map((row) => {
                      const average = calculateAverage(
                        row.terms.PRELIM ?? 0,
                        row.terms.MIDTERM ?? 0,
                        row.terms.FINAL ?? 0
                      );
                      const gradeEq = calculateEQ(average);
                      const remarks = getRemarks(
                        row.terms.PRELIM ?? 0,
                        row.terms.MIDTERM ?? 0,
                        row.terms.FINAL ?? 0,
                        gradeEq
                      );
                      const isFailed = gradeEq > 3.0;

                      return (
                        <tr key={row.StudentId}>
                          <td>{row.StudentId}</td>
                          <td className={styles.studentName}>
                            {`${row.LastName ?? ""}, ${row.FirstName ?? ""} ${
                              row.MiddleInitial ?? ""
                            }.`}
                          </td>
                          <td>{row.terms.PRELIM}</td>
                          <td>{row.terms.MIDTERM}</td>
                          <td>{row.terms.FINAL}</td>
                          <td>{average.toFixed(2)}</td>
                          <td>{gradeEq}</td>
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
        </main>
      </div>
    </>
  );
};

export default ReportSheet;
