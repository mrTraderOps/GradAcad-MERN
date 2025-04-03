import { useEffect, useState } from "react";
import styles from "./styles/AreYouSure.module.scss";
import loadingAnimation from "../../assets/webM/loading.webm";
import loadingHorizontal from "../../assets/webM/loadingHorizontal.webm";
import axios from "axios";
import { DetailProps } from "@/hooks/useGrade";

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onRefetch: () => void;
}

export const RevisionRequest = ({ isOpen, onCancel, onRefetch }: Props) => {
  const [profData, setProfData] = useState<{ refId: string; name: string }[]>(
    []
  );

  const [subjectData, setSubjectData] = useState<DetailProps[]>([]);
  const [filteredData, setFilteredData] = useState<DetailProps[]>([]);

  const [ModalContentLoading, setModalContent1Loading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedProf, setSelectedProf] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const [selectedAcadYr, setSelectedAcadYr] = useState<string>("");
  const [selectedSem, setSelectedSem] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");

  const [filteredSubject, setFilteredSubject] = useState<string[]>([]);
  const [filteredSections, setFilteredSections] = useState<string[]>([]);
  const [uniqueDept, setUniqueDepts] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/user/getAllUsersForGradeRequest"
        );

        if (response.data.success) {
          setProfData(response.data.users);
        } else {
          setProfData([]); // Set empty array if no data
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
        setProfData([]);
      }
    };

    fetchProfs();
  }, []);

  useEffect(() => {
    const fetchAllSubjects = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await axios.post(
          "http://localhost:5000/api/v1/grade/revisionRequest",
          { profId: selectedProf } // Only include the username
        );

        if (response.data.success) {
          setSubjectData(response.data.data);
          setLoading(false);
        } else {
          setSubjectData([]); // Set empty array if no data
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
        setSubjectData([]);
      }
    };

    fetchAllSubjects();
  }, [selectedProf]);

  const uniqueAcadYrs = [
    ...new Set(subjectData?.map((item) => item.acadYr) || []),
  ];

  const uniqueSems = [...new Set(subjectData?.map((item) => item.sem) || [])];

  useEffect(() => {
    setFilteredData([]);
    setUniqueDepts([]);
    setFilteredSubject([]);
    setFilteredSections([]);

    if (!selectedAcadYr || !selectedSem) return;

    // ✅ Step 1: Filter data based on Academic Year & Semester
    const newFilteredData =
      subjectData?.filter(
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
  }, [selectedAcadYr, selectedSem, subjectData]);

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
    !selectedSection ||
    !selectedTerm;

  const handleConfirm = () => {
    setModalContent1Loading(true);

    const confirmData = {
      refId: selectedProf,
      name: selectedName,
      subjectId: selectedSubject,
      acadYr: selectedAcadYr,
      sem: selectedSem,
      dept: selectedDept,
      sect: selectedSection,
      term: selectedTerm,
    };

    const isDataValid = Object.values(confirmData).every(
      (value) => value !== null && value !== ""
    );

    if (!isDataValid) {
      setErrorMessage("No data found. Invalid data.");
      setModalContent1Loading(false);
      return;
    }

    const setRequest = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/v1/grade/setRequest",
          confirmData
        );

        if (response.data.success) {
          alert("Request is successfully granted and created!");
          onRefetch();
          setTimeout(() => {
            setModalContent1Loading(false);
            onCancel();
          }, 1000);
        } else {
          setErrorMessage(
            response.data.message || "Failed to grant request. Please try Again"
          );
          setModalContent1Loading(false);
        }
      } catch (error: any) {
        setErrorMessage(
          error.response.data.message ||
            "Failed to grant request. Please try Again"
        );
      } finally {
        setModalContent1Loading(false);
      }
    };

    setRequest();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      {ModalContentLoading ? (
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
          <h3>Grade Revision Request</h3>

          {/* Academic Year Dropdown */}
          <div className={styles.filterGroup}>
            <label htmlFor="prof">Instructor's Name:</label>
            <select
              id="prof"
              value={selectedProf}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedProf(selectedId);

                // Find the corresponding name from profData
                const selectedProfData = profData.find(
                  (prof) => prof.refId === selectedId
                );
                setSelectedName(selectedProfData ? selectedProfData.name : "");
              }}
            >
              <option value="">Select an Instructor</option>
              {profData.map((ref) => (
                <option key={ref.refId} value={ref.refId}>
                  {ref.name} {/* Use ref.name to show professor's name */}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                height: "80px",
                paddingBottom: "20px",
              }}
            >
              <video
                autoPlay
                loop
                muted
                className={styles.loadingAnimation}
                height={80}
              >
                <source src={loadingHorizontal} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : errorMessage ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              NOTICE: {errorMessage}
            </div>
          ) : (
            <>
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

              {/* Course Subject Dropdown */}
              <div className={styles.filterGroup}>
                <label htmlFor="courseCode">Course Code & Subject:</label>
                <select
                  className={styles.Cc}
                  id="courseCode"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
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

              {/* Section Dropdown */}
              <div className={styles.filterGroup}>
                <label htmlFor="Term">Terms:</label>
                <select
                  id="Term"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <option value="">Select a Term</option>
                  <option value="PRELIM">PRELIM</option>
                  <option value="MIDTERM">MIDTERM</option>
                  <option value="FINAL">FINAL</option>
                </select>
              </div>
            </>
          )}

          <div className={styles.modalActions1}>
            <button
              className={styles.cancel}
              onClick={() => {
                onCancel();
                setSelectedProf("");
                setSelectedAcadYr("");
                setSelectedSem("");
                setSelectedDept("");
                setSelectedSection("");
                setSelectedSubject("");
              }}
            >
              Cancel
            </button>
            <button
              className={styles.confirm}
              onClick={handleConfirm}
              disabled={isGenerateDisabled} // Disable the button if any field is not selected
            >
              Grant Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
