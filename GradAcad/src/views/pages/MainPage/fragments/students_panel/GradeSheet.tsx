import styles from "./styles/StudentsPanel.module.scss";
import { calculateEQ } from "../../../../../utils/helpers/calculateEQ";
import { getRemarks } from "../../../../../utils/helpers/getRemarks";
import { useTerm } from "../../../../../hooks/useTerm";
import { useCombinedData } from "../../../../../hooks/useCombinedData";
import { useContext, useMemo, useState } from "react";
import { GradingReference } from "../../../../components/EqScale";
import { usePopupVisibility } from "../../../../../hooks/usePopupVisibility";
import SwitchPanel from "../../../../components/SwitchPanel";
import { SubjectData } from "../../../../../models/types/SubjectData";
import { DataProps } from "../../../../../models/types/StudentData";
import ExportExcel from "../../../../../utils/ExportExcel";
import { UserContext } from "../../../../../context/UserContext";
import { calculateAverage } from "../../../../../utils/helpers/calculateAve";

interface GradeSheetProps {
  onSubjectClick: () => void;
  onStudentClick: (data: SubjectData[], nextPanel: string) => void;
  data: any;
}

const GradeSheet = ({
  onSubjectClick,
  data,
  onStudentClick,
}: GradeSheetProps) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;

  const { subjectCode, subjectName, dept, section }: DataProps = data;

  const { terms } = useTerm();
  const { isPopupVisible, openPopup, closePopup } = usePopupVisibility();
  const [switchPanel, setSwitchPanel] = useState(false);
  const openSwitch = () => setSwitchPanel(true);
  const closeSwitch = () => setSwitchPanel(false);

  const activeTerms = useMemo(() => {
    return terms.length > 0
      ? Object.entries(terms[0].term[0])
          .filter(([_, value]) => value)
          .map(([key]) => key.toUpperCase())
      : [];
  }, [terms]);

  const { combinedData, errorMessage, loading } = useCombinedData({
    dept,
    sect: section,
    subjCode: subjectCode,
    terms: activeTerms,
  });

  const handleGotoEncode = (term: string) => {
    const updatedData = { ...data, term: [term] };
    // Switch to the EncodeGrade panel
    onStudentClick([updatedData], "students");
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
          <ExportExcel
            combinedData={combinedData}
            loggedName={user?.name ?? ""}
            dept={dept}
            subjectCode={subjectCode}
            subjectName={subjectName}
            section={section}
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
        <footer>
          <button onClick={openSwitch}>
            <p>Switch Panel</p>
          </button>
          <button onClick={openPopup}>
            <p>Grading Reference</p>
          </button>
        </footer>
      </main>
      <GradingReference isVisible={isPopupVisible} onClose={closePopup} />
      <SwitchPanel
        isVisible={switchPanel}
        onClose={closeSwitch}
        isGradeSheet={true}
        isChangeTitle="Go to Grade Encoding (Select Term):"
        onTermChange={handleGotoEncode}
      />
    </>
  );
};

export default GradeSheet;
