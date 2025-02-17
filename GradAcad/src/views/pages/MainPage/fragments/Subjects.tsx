import courseStyles from "../styles/Subjects.module.scss";
import style from "../styles/department.module.scss";
import { SubjectData } from "../../../../models/types/SubjectData";
import { useSubjects } from "../../../../hooks/useSubjects";
import SelectCourseSection from "./students_panel/C_S";
import { usePopupVisibility } from "../../../../hooks/usePopupVisibility";
import c_s from "../fragments/students_panel/styles/C_S.module.scss";
import { useState } from "react";
import { useTerm } from "../../../../hooks/useTerm";

interface Props {
  LoggeduserName: string | undefined;
  onStudentClick: (data: SubjectData[], nextPanel: string) => void;
}

const Subjects: React.FC<Props> = ({ LoggeduserName, onStudentClick }) => {
  const [activeTab, setActiveTab] = useState("encode");
  const { subjects, errorMessage } = useSubjects(LoggeduserName);
  const { isPopupVisible, openPopup, closePopup } = usePopupVisibility();
  const { terms, error, loading, hasActiveTerms } = useTerm();
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(
    null
  );
  const [selectedTerm, setSelectedTerm] = useState<string>("PRELIM");

  const getClassForDept = (dept: string) => {
    switch (dept) {
      case "Gen":
        return style.gen;
      case "BSCS":
        return style.cs;
      case "BEED":
      case "BSED":
        return style.coed;
      case "BSHM":
        return style.hm;
      default:
        return "";
    }
  };

  return (
    <>
      <header>
        <h2>Subjects</h2>
      </header>
      <main className={courseStyles.mainSubjects}>
        {errorMessage ? (
          <p className={courseStyles.error}>{errorMessage}</p>
        ) : subjects.length === 0 ? (
          <p className={courseStyles.loading}>Loading subjects...</p>
        ) : (
          <div className={courseStyles.listSubjects}>
            <ul>
              {subjects.map((subject, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      setSelectedSubject(subject); // Store the selected subject
                      openPopup();
                    }}
                  >
                    <div>
                      <div className={getClassForDept(subject.dept)}></div>
                      <div className={style.deptName}>
                        <h2>{subject.subjectCode}</h2>
                        <p>{subject.subjectName}</p>
                        <p>{`${subject.dept} - ${subject.section}`}</p>
                      </div>
                      <footer>
                        <p>First Semester A.Y. 2023 - 2024</p>
                      </footer>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <SelectCourseSection isVisible={isPopupVisible} onClose={closePopup}>
        <div className={courseStyles.header}>
          <h3>Select Filter</h3>
          <section className={c_s.buttonGroup}>
            <button
              className={
                activeTab === "encode" ? c_s.activeButton : c_s.inactiveButton
              }
              onClick={() => setActiveTab("encode")}
            >
              Encode Grade
            </button>
            <button
              className={
                activeTab === "gradesheet"
                  ? c_s.activeButton
                  : c_s.inactiveButton
              }
              onClick={() => setActiveTab("gradesheet")}
            >
              Grade Sheet
            </button>
          </section>

          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className={activeTab === "encode" ? "" : c_s.unselect}
          >
            {error ? (
              <option disabled>Error loading terms</option>
            ) : loading ? ( // Use `loading` from `useTerm`
              <option>Loading terms...</option>
            ) : terms.length > 0 ? (
              terms.map((termData, index) =>
                termData.term && termData.term.length > 0
                  ? Object.entries(termData.term[0]).map(
                      ([termKey, termValue]) =>
                        termValue ? (
                          <option
                            key={`${index}-${termKey}`}
                            value={termKey.toUpperCase()}
                          >
                            {termKey.toUpperCase()}
                          </option>
                        ) : null
                    )
                  : null
              )
            ) : (
              <option disabled>No terms available</option>
            )}
          </select>

          <button
            className={c_s.submitButton}
            onClick={() => {
              if (selectedSubject) {
                const combinedData = {
                  ...selectedSubject,
                  term: selectedTerm,
                };

                if (activeTab === "encode") {
                  onStudentClick([combinedData], "students");
                } else if (activeTab === "gradesheet") {
                  onStudentClick([combinedData], "gradesheet");
                }

                closePopup();
              }
            }}
            disabled={!hasActiveTerms}
          >
            Submit
          </button>
        </div>
      </SelectCourseSection>
    </>
  );
};

export default Subjects;
