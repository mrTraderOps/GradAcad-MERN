import styles from "../fragments/students_panel/styles/StudentsPanel.module.scss";
import style from "../styles/Department.module.scss";
import { useContext, useMemo } from "react";
import { UserContext } from "../../../../context/UserContext";
import { useTerm } from "../../../../hooks/useTerm";
import { useCombinedData } from "../../../../hooks/useCombinedData";
import ExportExcel from "../../../../utils/ExportExcel";
import { calculateAverage } from "../../../../utils/helpers/calculateAve";
import { calculateEQ } from "../../../../utils/helpers/calculateEQ";
import { getRemarks } from "../../../../utils/helpers/getRemarks";

const Sheet = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user, confirmData } = context;

  const { subjCode, subjName, dept, sect } = confirmData[0];

  const { terms } = useTerm();

  const activeTerms = useMemo(() => {
    return terms.length > 0
      ? Object.entries(terms[0].term[0])
          .filter(([_, value]) => value)
          .map(([key]) => key.toUpperCase())
      : [];
  }, [terms]);

  const { combinedData, errorMessage, loading } = useCombinedData({
    dept,
    sect: sect,
    subjCode: subjCode,
    terms: activeTerms,
  });

  return (
    <>
      <div className={style.department}>
        <div className={styles.preloader}>
          <p>Subject &gt; Section </p>
          <p>First Semester A.Y. 2023-2024</p>
        </div>
        <header className={styles.headerStudentsPanel}>
          <div className={styles.div1}>
            <button onClick={() => {}}>
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
              COURSE & SECTION : {dept} - {sect}
            </p>
          </div>

          <div className={styles.div3}>
            <ExportExcel
              combinedData={combinedData}
              loggedName={user?.name ?? ""}
              dept={dept}
              subjectCode={subjCode}
              subjectName={subjName}
              section={sect}
            />
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
                      {activeTerms.includes("PRELIM") && (
                        <th>
                          <h5>PRELIM</h5>
                        </th>
                      )}
                      {activeTerms.includes("MIDTERM") && (
                        <th>
                          <h5>MIDTERM</h5>
                        </th>
                      )}
                      {activeTerms.includes("FINAL") && (
                        <th>
                          <h5>FINAL</h5>
                        </th>
                      )}
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
                          {activeTerms.includes("PRELIM") && (
                            <td>{row.terms.PRELIM}</td>
                          )}
                          {activeTerms.includes("MIDTERM") && (
                            <td>{row.terms.MIDTERM}</td>
                          )}
                          {activeTerms.includes("FINAL") && (
                            <td>{row.terms.FINAL}</td>
                          )}
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

export default Sheet;
