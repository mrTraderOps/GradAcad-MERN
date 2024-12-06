import styles from "./styles/StudentsPanel.module.scss";
import { useState, useEffect } from "react";
import StudentData from "../../../../../models/StudentData";
import SemestralGrade from "../../../../../models/SemestralGrade";

interface Props {
  onSubjectClick: () => void;
  data: {
    subjectCode: string;
    subjectName: string;
    course: string;
    section: string;
  };
}

interface Student {
  studentId: string;
  studentName: {
    lastName: string;
    firstName: string;
    middleInitial: string;
  };
}

interface Grade {
  studentId: string;
  prelim?: number;
  midterm?: number;
  final?: number;
}

interface CombinedData extends Student, Grade {}

const GradeSheet = ({ data, onSubjectClick }: Props) => {
  const { subjectCode, subjectName, course, section } = data;

  const [combinedData, setCombinedData] = useState<CombinedData[]>([]);

  const capitalizeWords = (str: string) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const calculateAverage = (prelim: number, midterm: number, final: number) => {
    return (prelim + midterm + final) / 3 || 0;
  };

  const calculateEQ = (term: number) => {
    const ranges = [
      { min: 96.5, grade: 1.0 },
      { min: 93.5, grade: 1.25 },
      { min: 90.5, grade: 1.5 },
      { min: 87.5, grade: 1.75 },
      { min: 84.5, grade: 2.0 },
      { min: 81.5, grade: 2.25 },
      { min: 75.5, grade: 2.75 },
      { min: 74.5, grade: 3.0 },
    ];

    const match = ranges.find((range) => term >= range.min);
    return match ? match.grade : 5.0; // Default to 5.0 if no match
  };

  const getRemarks = (
    prelim: number,
    midterm: number,
    final: number,
    fg: number
  ) => {
    const terms = [prelim, midterm, final];
    const nonZeroCount = terms.filter((term) => term > 0).length;

    if (nonZeroCount === 1) {
      return (
        <select>
          <option value="AW">AW</option>
          <option value="UW">UW</option>
          <option value="NCA">NCA</option>
          <option value="INC">INC</option>
        </select>
      );
    }

    return fg === 5.0 ? "FAILED" : "PASSED";
  };

  useEffect(() => {
    const students: Student[] = [];
    StudentData.forEach((courseData) => {
      Object.values(courseData).forEach((studentList) => {
        students.push(...studentList);
      });
    });

    const combined = students.map((student) => {
      const semGrade = SemestralGrade.find(
        (grade) => grade.studentId === student.studentId
      );
      return {
        ...student,
        ...semGrade,
      } as CombinedData;
    });

    setCombinedData(combined);
  }, []);

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
            COURSE & SECTION : {course} - {section}
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
                    <h5>#</h5>
                  </th>
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

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{row.studentId}</td>
                      <td className={styles.studentName}>
                        {`${row.studentName.lastName}, ${row.studentName.firstName} ${row.studentName.middleInitial}`}
                      </td>
                      <td>{row.prelim}</td>
                      <td>{row.midterm}</td>
                      <td>{row.final}</td>
                      <td>{average.toFixed(2)}</td>
                      <td>{fg}</td>
                      <td>{remarks}</td>
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
