import courseStyles from "../styles/Subjects.module.scss";
import style from "../styles/department.module.scss";
import { SubjectData } from "../../../../models/types/SubjectData";
import { useSubjects } from "../../../../hooks/useSubjects";
import { useContext, useEffect, useState } from "react";
import { useTerm } from "../../../../hooks/useTerm";
import { UserContext } from "../../../../context/UserContext";

interface Props {
  onStudentClick: (data: SubjectData[], nextPanel: string) => void;
}

const Subjects: React.FC<Props> = ({ onStudentClick }) => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("Subjects must be used within a UserProvider");
  }

  const { user } = context;

  // Fetch subjects and terms
  const { subjects, errorMessage, acadYr, sem } = useSubjects(user?.email);
  const {
    error,
    loading,
    hasActiveTerms,
    activeTerms,
    initialTerm,
    activeAcadYrs,
    initialAcadYr,
    activeSems,
    initialSem,
  } = useTerm();

  // State for selected academic year, semester, and term
  const [selectedAcadYr, setSelectedAcadYr] = useState<string>(initialAcadYr);
  const [selectedSem, setSelectedSem] = useState<string>(initialSem);
  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm);

  // Sync selected values with initial values
  useEffect(() => {
    setSelectedAcadYr(initialAcadYr);
  }, [initialAcadYr]);

  useEffect(() => {
    setSelectedSem(initialSem);
  }, [initialSem]);

  useEffect(() => {
    setSelectedTerm(initialTerm);
  }, [initialTerm]);

  // Handle subject click
  const handleSubjectClick = (subject: SubjectData) => {
    if (!hasActiveTerms) {
      alert("No active terms available.");
      return;
    }

    // Combine subject data with selected academic year, semester, and term
    const combinedData = {
      ...subject,
      term: [selectedTerm],
      acadYr: selectedAcadYr,
      sem: selectedSem,
    };

    // Set the active panel to "encode" and pass the data
    onStudentClick([combinedData], "students");
  };
  // Get department-specific class for styling
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
        <div>
          <label htmlFor="academicYear">Academic Year:</label>
          <select
            id="academicYear"
            value={selectedAcadYr}
            onChange={(e) => setSelectedAcadYr(e.target.value)}
          >
            {activeAcadYrs.map((acadYr) => (
              <option key={acadYr} value={acadYr}>
                {acadYr}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sem">Semester:</label>
          <select
            id="sem"
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
          >
            {activeSems.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="term">Term:</label>
          <select
            id="term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            {["PRELIM", "MIDTERM", "FINAL"].map((term) => {
              if (activeTerms.includes(term.toLowerCase())) {
                return (
                  <option key={term} value={term}>
                    {term}
                  </option>
                );
              }
              return null;
            })}
          </select>
        </div>
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
                  <button onClick={() => handleSubjectClick(subject)}>
                    <div>
                      <div className={getClassForDept(subject.dept)}></div>
                      <div className={style.deptName}>
                        <h2>{subject.subjectCode}</h2>
                        <p>{subject.subjectName}</p>
                        <p>{`${subject.dept} - ${subject.section}`}</p>
                      </div>
                      <footer>
                        <p>
                          {sem} Semester A.Y. {acadYr}
                        </p>
                      </footer>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
};

export default Subjects;
