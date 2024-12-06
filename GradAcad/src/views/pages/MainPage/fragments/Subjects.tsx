import { useState, useEffect } from "react";
import course_styles from "../styles/Subjects.module.scss";
import style from "../styles/department.module.scss";
import subjectData from "../../../../models/SubjectData";

interface Props {
  onStudentClick: Function;
  LoggeduserName: string;
}

interface SubjectData {
  username: string;
  dept: string;
  subjectCode: string;
  subjectName: string;
  section: string;
}

const Subjects = ({ onStudentClick, LoggeduserName }: Props) => {
  const [subjects, setSubjects] = useState<SubjectData[]>([]);

  // Use useEffect to set filtered subjects when LoggeduserName changes
  useEffect(() => {
    if (LoggeduserName) {
      const filteredSubjects = subjectData.filter(
        (subject) => subject.username === LoggeduserName
      );
      setSubjects(filteredSubjects);
    }
  }, [LoggeduserName]);

  // Function to determine department class
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
      <main className={course_styles.mainSubjects}>
        <div className={course_styles.listSubjects}>
          <ul>
            {subjects.map((subject, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    onStudentClick(subject);
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
      </main>
    </>
  );
};

export default Subjects;
