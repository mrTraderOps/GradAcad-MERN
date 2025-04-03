import { useContext, useEffect, useState } from "react";
import styles from "./styles/AreYouSure.module.scss";
import { DetailProps, useGradeForRegistrar } from "../../hooks/useGrade";
import { UserContext } from "../../context/UserContext";
import loadingAnimation from "../../assets/webM/loading.webm";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onRefetch: () => void;
}

export const EnlismentReport = ({ isOpen, onCancel, onRefetch }: Props) => {
  const { data, errorMessage, loading } = useGradeForRegistrar();

  const context = useContext(UserContext);
  const { addConfirmData }: any = context;

  const [filteredData, setFilteredData] = useState<DetailProps[]>([]);

  const [ModalContentLoading, setModalContent1Loading] = useState(false);
  const [errorModal, setErrorMessage] = useState("");
  const [selectedAcadYr, setSelectedAcadYr] = useState<string>("");
  const [selectedSem, setSelectedSem] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  const [filteredSubject, setFilteredSubject] = useState<string[]>([]);
  const [filteredSections, setFilteredSections] = useState<string[]>([]);
  const [uniqueDept, setUniqueDepts] = useState<string[]>([]);

  // Extract unique academic years and semesters from data
  const uniqueAcadYrs = [...new Set(data?.map((item) => item.acadYr) || [])];
  const uniqueSems = [...new Set(data?.map((item) => item.sem) || [])];

  useEffect(() => {
    setFilteredData([]);
    setUniqueDepts([]);
    setFilteredSubject([]);
    setFilteredSections([]);

    if (!selectedAcadYr || !selectedSem) return;

    // ✅ Step 1: Filter data based on Academic Year & Semester
    const newFilteredData =
      data?.filter(
        (item) => item.acadYr === selectedAcadYr && item.sem === selectedSem
      ) || [];

    setFilteredData(newFilteredData);

    // ✅ Step 2: Extract unique departments
    setUniqueDepts([
      ...new Set(newFilteredData.map((item) => item.dept) || []),
    ]);

    // ✅ Reset Course and Section when AcadYr/Sem changes
    setSelectedDept("");
    setSelectedSubject("");
    setSelectedSection("");
  }, [selectedAcadYr, selectedSem, data]);

  useEffect(() => {
    if (!selectedDept) {
      setFilteredSubject([]);
      setFilteredSections([]);
      return;
    }

    const newFilteredCourses = filteredData
      .filter((item) => item.dept === selectedDept)
      .map((item) => ({
        courseCode: item.subjectId,
      }));

    setFilteredSubject([
      ...new Set(newFilteredCourses.map((course) => `${course.courseCode}`)),
    ]);

    setSelectedSubject(""); // Reset course selection when dept changes
  }, [selectedDept, filteredData]);

  useEffect(() => {
    if (!selectedSubject) {
      setFilteredSections([]);
      return;
    }

    const newFilteredSections = filteredData
      .filter((item) => `${item.subjectId}` === selectedSubject.trim())
      .map((item) => item.sect);

    setFilteredSections([...new Set(newFilteredSections)]);
  }, [selectedSubject, filteredData]);

  const isGenerateDisabled =
    !selectedAcadYr ||
    !selectedSem ||
    !selectedDept ||
    !selectedSubject ||
    !selectedSection;

  const handleConfirm = () => {
    setModalContent1Loading(true);

    const confirmData = {
      acadYr: selectedAcadYr,
      sem: selectedSem,
      dept: selectedDept,
      sect: selectedSection,
      subjCode: selectedSubject,
    };

    const isDataValid = Object.values(confirmData).every(
      (value) => value !== null && value !== ""
    );

    if (!isDataValid) {
      setErrorMessage("No data found. Invalid data.");
      setModalContent1Loading(false);
      return;
    }

    addConfirmData(confirmData);

    setTimeout(() => {
      onRefetch();
      setModalContent1Loading(false);
      onCancel();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      {loading ? (
        <div>Loading...</div>
      ) : errorMessage ? (
        <div>Error: {errorMessage}</div>
      ) : ModalContentLoading ? (
        <div className={styles.modalContent1}>
          <h2>Loading.. Please Wait</h2>
          <video
            autoPlay
            loop
            muted
            className={styles.loadingAnimation}
            height={100}
          >
            <source src={loadingAnimation} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className={styles.modalContent1}>
          <h3>Select a Subject</h3>

          {/* Academic Year Dropdown */}
          <div className={styles.filterGroup}>
            <label htmlFor="academicYear">Academic Year:</label>
            <select
              id="academicYear"
              value={selectedAcadYr}
              onChange={(e) => setSelectedAcadYr(e.target.value)}
              style={{ width: "30%" }}
            >
              <option value="">Select Academic Year</option>
              {uniqueAcadYrs.map((acadYr, index) => (
                <option key={index} value={acadYr}>
                  {acadYr}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Dropdown */}
          <div className={styles.filterGroup}>
            <label htmlFor="semester">Semester:</label>
            <select
              id="semester"
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
            >
              <option value="">Select Semester</option>
              {uniqueSems.map((sem, index) => (
                <option key={index} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div className={styles.filterGroup}>
            <label htmlFor="department">Department:</label>
            <select
              id="department"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">Select Department</option>
              {uniqueDept.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Course Subject Dropdown */}
          <div className={styles.filterGroup}>
            <label htmlFor="courseCode">Course Subject:</label>
            <select
              className={styles.Cc}
              id="courseCode"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ width: "30%" }}
            >
              <option value="">Select Course</option>
              {filteredSubject.map((course, index) => (
                <option key={index} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          {/* Section Dropdown */}
          <div className={styles.filterGroup}>
            <label htmlFor="section">Section:</label>
            <select
              id="section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">Select Section</option>
              {filteredSections.map((section, index) => (
                <option key={index} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalActions1}>
            <button className={styles.cancel} onClick={onCancel}>
              Cancel
            </button>
            <button
              className={styles.confirm}
              onClick={handleConfirm}
              disabled={isGenerateDisabled} // Disable the button if any field is not selected
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
