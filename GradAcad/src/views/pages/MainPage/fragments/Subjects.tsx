import courseStyles from "../styles/Subjects.module.scss";
import style from "../styles/Department.module.scss";
import { SubjectData } from "../../../../models/types/SubjectData";
import { useSubjectsV2 } from "../../../../hooks/useSubjects";
import { useContext, useEffect, useState } from "react";
import { useTerm } from "../../../../hooks/useTerm";
import { UserContext } from "../../../../context/UserContext";
import loadingAnimation from "../../../../assets/webM/loading.webm";
import notfound from "../../../../assets/images/notfound.jpg";

interface Props {
  onStudentClick: (data: SubjectData[], nextPanel: string) => void;
}

const Subjects: React.FC<Props> = ({ onStudentClick }) => {
  const context = useContext(UserContext);

  const { user }: any = context;

  if (!context) {
    throw new Error("Subjects must be used within a UserProvider");
  }

  const {
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
  const [isSorting, setIsSorting] = useState(false);

  useEffect(() => {
    setIsSorting(true);
    setSelectedAcadYr(initialAcadYr);
    setSelectedSem(initialSem);
    setSelectedTerm(initialTerm);

    setTimeout(() => {
      setIsSorting(false);
    }, 1000); // Adjust time as needed
  }, [initialAcadYr, initialSem, initialTerm]);

  // Fetch subjects and terms
  // const { subjects, errorMessage, acadYr, sem } = useSubjects(user?.email);
  const {
    subjects,
    errorMessage,
    loading: subjectsLoading,
  } = useSubjectsV2(user.refId, selectedAcadYr, selectedSem);

  const handleAcadYrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === "") {
      // Reset everything if "All" is selected in Academic Year
      setSelectedAcadYr("");
      setSelectedSem("");
    } else {
      // Reset Semester & Term to "All" when selecting another Academic Year
      setSelectedAcadYr(selectedValue);
      setSelectedSem("");
    }
  };

  const handleSemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    if (selectedValue === "") {
      setSelectedSem("");
    } else {
      setSelectedSem(selectedValue);
    }
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTerm(e.target.value);
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

  // Handle subject click
  const handleSubjectClick = (
    subject: SubjectData,
    acadYr: string,
    sem: string
  ) => {
    if (!hasActiveTerms) {
      alert("No active terms available.");
      return;
    }

    // Combine subject data with selected academic year, semester, and term
    const combinedData = {
      ...subject,
      term: [selectedTerm],
      acadYr: selectedAcadYr !== "" ? selectedAcadYr : acadYr,
      sem: selectedSem !== "" ? selectedSem : sem,
    };

    // Set the active panel to "encode" and pass the data
    onStudentClick([combinedData], "students");
  };

  return (
    <>
      <header style={{ gap: "100px" }}>
        <h2>Subjects</h2>
        <div>
          <label htmlFor="academicYear" style={{ textWrap: "nowrap" }}>
            Academic Year:
          </label>
          <select
            id="academicYear"
            value={selectedAcadYr}
            onChange={handleAcadYrChange}
          >
            <option value="">All</option>
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
            onChange={handleSemChange}
            style={{}}
          >
            <option value="">All</option>
            {activeSems.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="term">Term:</label>
          <select id="term" value={selectedTerm} onChange={handleTermChange}>
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
        {subjectsLoading || isSorting ? (
          <div
            className={courseStyles.loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <h2>Loading.. Please Wait</h2>
            <video
              autoPlay
              loop
              muted
              className={courseStyles.loadingAnimation}
              height={100}
            >
              <source src={loadingAnimation} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : errorMessage ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <img src={notfound} alt="not found" width={600} />
            <p className={courseStyles.error}>{errorMessage}.</p>
          </div>
        ) : subjects.length === 0 ? (
          <p>No subjects found.</p>
        ) : (
          <div className={courseStyles.listSubjects}>
            <ul>
              {subjects.map((subject, index) => (
                <li key={index}>
                  <button
                    onClick={() =>
                      handleSubjectClick(subject, subject.acadYr, subject.sem)
                    }
                  >
                    <div>
                      <div className={getClassForDept(subject.dept)}></div>
                      <div className={style.deptName}>
                        <h2>{subject.subjectCode}</h2>
                        <p>{subject.subjectName}</p>
                        <p>{`${subject.dept} - ${subject.section}`}</p>
                      </div>
                      <footer>
                        <p>
                          {subject.sem} Semester A.Y. {subject.acadYr}
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
