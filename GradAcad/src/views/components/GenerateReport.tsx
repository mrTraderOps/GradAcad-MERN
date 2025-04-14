import { useContext, useEffect, useState } from "react";
import styles from "./styles/AreYouSure.module.scss";
import {
  DetailProps,
  useGrade,
  useGradeForRegistrar,
} from "../../hooks/useGrade";
import { UserContext } from "../../context/UserContext";
import loadingAnimation from "../../assets/webM/loading.webm";
import { useNavigate } from "react-router-dom";
import { useTerm } from "../../hooks/useTerm";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  userId?: string;
  isRegistrar?: boolean;
}

export const GenerateReport = ({
  isOpen,
  onCancel,
  userId,
  isRegistrar,
}: Props) => {
  const navigate = useNavigate();

  const context = useContext(UserContext);
  const { addConfirmData }: any = context;

  const { initialAcadYr, initialSem } = useTerm();

  // Always call both hooks at the top level
  const gradeData = useGrade(userId ?? ""); // Fetch when userId exists
  const registrarData = useGradeForRegistrar(); // Fetch when no userId

  // Determine which data to use
  const data = userId ? gradeData.data : registrarData.data;
  const errorMessage = userId
    ? gradeData.errorMessage
    : registrarData.errorMessage;
  const loading = userId ? gradeData.loading : registrarData.loading;

  const [ModalContentLoading, setModalContent1Loading] = useState(false);
  const [selectedAcadYr, setSelectedAcadYr] = useState<string>(initialAcadYr);
  const [selectedSem, setSelectedSem] = useState<string>(initialSem);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  const [filteredData, setFilteredData] = useState<DetailProps[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [filteredSections, setFilteredSections] = useState<string[]>([]);
  const [uniqueDept, setUniqueDepts] = useState<string[]>([]);

  // Extract unique academic years and semesters from data
  const uniqueAcadYrs = [...new Set(data?.map((item) => item.acadYr) || [])];
  const uniqueSems = [...new Set(data?.map((item) => item.sem) || [])];

  useEffect(() => {
    if (!selectedAcadYr && uniqueAcadYrs.length > 0) {
      setSelectedAcadYr(uniqueAcadYrs[0]);
    }
    if (!selectedSem && uniqueSems.length > 0) {
      setSelectedSem(uniqueSems[0]);
    }
  }, [uniqueAcadYrs, uniqueSems]);

  useEffect(() => {
    setFilteredData([]);
    setUniqueDepts([]);
    setFilteredCourses([]);
    setFilteredSections([]);

    if (!selectedAcadYr || !selectedSem) return;

    const newFilteredData =
      data?.filter(
        (item) => item.acadYr === selectedAcadYr && item.sem === selectedSem
      ) || [];

    setFilteredData(newFilteredData);

    setUniqueDepts([
      ...new Set(newFilteredData.map((item) => item.dept) || []),
    ]);

    setSelectedDept("");
    setSelectedCourse("");
    setSelectedSection("");
  }, [selectedAcadYr, selectedSem, data]);

  useEffect(() => {
    if (!selectedDept) {
      setFilteredCourses([]);
      setFilteredSections([]);
      return;
    }

    const newFilteredCourses = filteredData
      .filter((item) => item.dept === selectedDept)
      .map((item) => ({
        courseCode: item.subjectId,
        courseSubject: item.subjectName || "Unknown",
      }));

    setFilteredCourses([
      ...new Set(
        newFilteredCourses.map(
          (course) => `${course.courseCode} - ${course.courseSubject}`
        )
      ),
    ]);

    setSelectedCourse(""); // Reset course selection when dept changes
  }, [selectedDept, filteredData]);

  useEffect(() => {
    if (!selectedCourse) {
      setFilteredSections([]);
      return;
    }

    const newFilteredSections = filteredData
      .filter(
        (item) =>
          `${item.subjectId} - ${item.subjectName}` === selectedCourse.trim()
      )
      .map((item) => item.sect);

    setFilteredSections([...new Set(newFilteredSections)]);
  }, [selectedCourse, filteredData]);

  const isGenerateDisabled =
    !selectedAcadYr ||
    !selectedSem ||
    !selectedDept ||
    !selectedCourse ||
    !selectedSection;

  const handleConfirm = () => {
    setModalContent1Loading(true);

    const [subjectCode, subjectName] = selectedCourse.split(" - ");

    const confirmData = {
      sem: selectedSem,
      acadYr: selectedAcadYr,
      dept: selectedDept,
      sect: selectedSection,
      subjCode: subjectCode,
      subjName: subjectName,
    };

    const isDataValid = Object.values(confirmData).every(
      (value) => value !== null && value !== ""
    );

    if (!isDataValid) {
      setModalContent1Loading(false);
      return;
    }

    addConfirmData(confirmData);

    if (!isRegistrar) {
      setTimeout(() => {
        // Navigate to GradeSheet.tsx or perform the next action
        navigate("/reportsheet");
      }, 2000); // Adjust the delay as needed
    }

    setTimeout(() => {
      setModalContent1Loading(false);
      onCancel();
    }, 2000);
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
          <h3>Generate Report</h3>

          {/* Academic Year Dropdown */}
          <div className={styles.filterGroup}>
            <label htmlFor="academicYear">Academic Year:</label>
            <select
              id="academicYear"
              value={selectedAcadYr}
              onChange={(e) => setSelectedAcadYr(e.target.value)}
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

          {/* Course Code - Course Subject Dropdown */}
          <div className={styles.filterGroup}>
            <label htmlFor="courseCode">Course Code & Subject:</label>
            <select
              className={styles.Cc}
              id="courseCode"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {filteredCourses.map((course, index) => (
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
              Generate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
