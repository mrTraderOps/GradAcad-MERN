import { useState } from "react";
import styles from "./styles/AreYouSure.module.scss";

interface Props {
  isOpen: boolean;
  onConfirm: (filters: {
    semester: string;
    academicYear: string;
    department: string;
    section: string;
    courseCode: string;
  }) => void;
  onCancel: () => void;
}

export const GenerateReport = ({ isOpen, onConfirm, onCancel }: Props) => {
  // State to manage selected filters
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [courseCode, setCourseCode] = useState("");

  // Handle confirm button click
  const handleConfirm = () => {
    onConfirm({
      semester,
      academicYear,
      department,
      section,
      courseCode,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent1}>
        <h3>Select Filter</h3>

        {/* Academic Year Dropdown */}
        <div className={styles.filterGroup}>
          <label htmlFor="academicYear">Academic Year:</label>
          <select
            id="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="">Select Academic Year</option>
            <option value="2022-2023">2022-2023</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>

        {/* Semester Dropdown */}
        <div className={styles.filterGroup}>
          <label htmlFor="semester">Semester:</label>
          <select
            id="semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Select Semester</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="Summer">Summer</option>
          </select>
        </div>

        {/* Department Dropdown */}
        <div className={styles.filterGroup}>
          <label htmlFor="department">Department:</label>
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business Administration">
              Business Administration
            </option>
          </select>
        </div>

        {/* Section Dropdown */}
        <div className={styles.filterGroup}>
          <label htmlFor="section">Section:</label>
          <select
            id="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        {/* Course Code - Course Subject Dropdown */}
        <div className={styles.filterGroup}>
          <label htmlFor="courseCode">Course Code & Subject:</label>
          <select
            className={styles.Cc}
            id="courseCode"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          >
            <option value="">Select Course</option>
            <option value="CS101 - Introduction to Computer Science">
              CS101 - Introduction to Computer Science
            </option>
            <option value="MATH101 - Calculus">MATH101 - Calculus</option>
            <option value="ENG101 - English Composition">
              ENG101 - English Composition
            </option>
          </select>
        </div>

        {/* Modal Actions */}
        <div className={styles.modalActions1}>
          <button className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.confirm} onClick={handleConfirm}>
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};
