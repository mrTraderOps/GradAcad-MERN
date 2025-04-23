import styles from "../styles/MainPage.module.scss";
import studentImg from "../../../../assets/images/student_image.jpg";
import nclogo from "../../../../assets/images/nc_logo.png";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { useTerm } from "../../../../hooks/useTerm";
import { useContext, useEffect, useMemo, useState } from "react";
import API from "../../../../context/axiosInstance";
import { UserContext } from "../../../../context/UserContext";
import { calculateAverage } from "../../../../utils/helpers/calculateAve";
import { calculateEQ, getRemark } from "../../../../utils/helpers/calculateEQ";
import loadingHorizontal from "../../../../assets/webM/loading.webm";

export interface StudentDetails {
  _id: string;
  LastName: string;
  FirstName: string;
  MiddleInitial: string;
  SectionId: string;
  StudentType: string;
}

export interface StudentGradeDetails {
  _id: string;
  SubjectId: string;
  SubjectName: string;
  Credits: number;
  acadYr: string;
  sem: string;
  terms: {
    PRELIM?: number;
    MIDTERM?: number;
    FINAL?: number;
  };
  prelimRemarks?: string;
  midtermRemarks?: string;
  finalRemarks?: string;
}

const GradeViewing = () => {
  const iconWH = 270;
  let courseName = "Unknown Course";
  let yearLevel = "Unknown Year";

  const context = useContext(UserContext);
  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;
  const {
    activeAcadYrs,
    activeSems,
    initialAcadYr,
    initialSem,
    donePrelim,
    doneMidterm,
    doneFinal,
  } = useTerm();

  const [totalCredits, setTotaCredits] = useState<number>(0);
  const [totalAverage, setTotalAverage] = useState<string>("");

  const [selectedSem, setSelectedSem] = useState<string>(initialAcadYr);
  const [selectedAcadYr, setSelectedAcadYr] = useState<string>(initialSem);
  const [academicYearOptions, setAcademicYearOptions] = useState<string[]>([]);
  const [semesterOptions, setSemesterOptions] = useState<string[]>([]);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(
    null
  );
  const [allStudentGrades, setAllStudentGrades] = useState<
    StudentGradeDetails[]
  >([]);
  const [filteredGrades, setFilteredGrades] = useState<StudentGradeDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.refId) return;
      setLoading(true);

      try {
        // Fetch student info
        const infoResponse = await API.post("/student/getStudentInfoById", {
          studentId: user.refId,
        });

        // Fetch student grades
        const gradesResponse = await API.post("/student/getAllStudentGrade", {
          studentId: user.refId,
        });

        if (infoResponse.data.success) {
          setStudentDetails(infoResponse.data.data);
        }

        if (gradesResponse.data.success) {
          setAllStudentGrades(gradesResponse.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.refId]);

  // 2. Extract unique academic years and semesters
  useEffect(() => {
    if (allStudentGrades.length > 0) {
      // Get unique academic years (sorted newest first)
      const years = [...new Set(allStudentGrades.map((g) => g.acadYr))].sort(
        (a, b) => b.localeCompare(a)
      );

      // Get unique semesters
      const sems = [...new Set(allStudentGrades.map((g) => g.sem))];

      setAcademicYearOptions(years);
      setSemesterOptions(sems);

      // Set initial selections
      if (years.length) setSelectedAcadYr(years[0]);
      if (sems.length) setSelectedSem(sems[0]);
    }
  }, [allStudentGrades]);

  // 3. Filter grades when selections change
  useEffect(() => {
    if (selectedAcadYr && selectedSem) {
      const filtered = allStudentGrades.filter(
        (grade) => grade.acadYr === selectedAcadYr && grade.sem === selectedSem
      );
      setFilteredGrades(filtered);
    }
  }, [allStudentGrades, selectedAcadYr, selectedSem]);

  if (studentDetails) {
    const sectionId = studentDetails.SectionId; // e.g., "BSCS-4A"
    const [courseCode, yearSection] = sectionId.split("-");
    const yearNumber = yearSection.match(/\d/)?.[0]; // Extract the digit

    const courseMap: Record<string, string> = {
      BSCS: "Bachelor of Science in Computer Science",
      BEED: "Bachelor of Elementary Education",
      BSED: "Bachelor of Secondary Education",
      BSHM: "Bachelor of Science in Hospitality Management",
      ACT: "Associate in Computer Technology",
    };

    const yearLevelMap: Record<string, string> = {
      "1": "First Year",
      "2": "Second Year",
      "3": "Third Year",
      "4": "Fourth Year",
    };

    courseName = courseMap[courseCode] || courseName;
    yearLevel = yearLevelMap[yearNumber || ""] || yearLevel;
  }

  const loadImage = async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  };

  const handlePrintPDF = async () => {
    const doc = new jsPDF();

    const pageWidthTitle = doc.internal.pageSize.getWidth();

    // Add top-left corner text
    doc.setFontSize(9);
    doc.setFont("times", "italic");
    doc.text("Student's Copy", pageWidthTitle - 30, 10);

    // Load logo image
    const NClogo = await loadImage(nclogo);

    // Logo dimensions
    const logoWidth = 28;
    const logoHeight = 28;
    const logoX = (pageWidthTitle - logoWidth) / 2; // Center horizontally

    // Add centered logo
    doc.addImage(NClogo, "PNG", logoX, 10, logoWidth, logoHeight);

    // Header text
    doc.setFontSize(13);
    doc.setFont("times", "bold");
    doc.text("NORZAGARAY COLLEGE", pageWidthTitle / 2, 45, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(
      "Municipal Compound, Poblacion, Norzagaray, Bulacan",
      pageWidthTitle / 2,
      50,
      { align: "center" }
    );

    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("CLASS CARD", pageWidthTitle / 2, 62, { align: "center" });

    // Left column x and right column x
    const leftX = 20;
    const rightX = pageWidthTitle / 2 + 25; // Slight offset from center

    // Starting Y position for both columns
    let startY = 75;
    const lineSpacing = 8;

    doc.setFontSize(10);
    doc.setFont("times", "bold");

    // LEFT SIDE
    doc.setFontSize(10);

    // Student ID
    doc.setFont("times", "normal");
    doc.text("Student ID: ", leftX, startY);
    doc.setFont("helvetica", "bold");
    doc.text(`${studentDetails?._id}`, leftX + 30, startY); // Adjust the offset

    // Student Name
    doc.setFont("times", "normal");
    doc.text("Student Name: ", leftX, startY + lineSpacing);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${studentDetails?.LastName.toUpperCase()}, ${studentDetails?.FirstName.toUpperCase()} ${
        studentDetails?.MiddleInitial
      }`,
      leftX + 30,
      startY + lineSpacing
    );

    // Course & Section
    doc.setFont("times", "normal");
    doc.text("Course & Section: ", leftX, startY + lineSpacing * 2);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${studentDetails?.SectionId}`,
      leftX + 30,
      startY + lineSpacing * 2
    );

    // RIGHT SIDE
    doc.setFont("times", "normal");
    doc.text("Academic Year: ", rightX, startY);
    doc.setFont("helvetica", "bold");
    doc.text(`${selectedAcadYr}`, rightX + 25, startY);

    doc.setFont("times", "normal");
    doc.text("Semester: ", rightX, startY + lineSpacing);
    doc.setFont("helvetica", "bold");
    doc.text(`${selectedSem} SEMESTER`, rightX + 25, startY + lineSpacing);

    // Extract table data
    const headers = Array.from(
      document.querySelectorAll("#studentTable th")
    ).map((th) => th.textContent);
    const rows = Array.from(
      document.querySelectorAll("#studentTable tbody tr")
    ).map((tr) =>
      Array.from(tr.querySelectorAll("td")).map((td) => td.textContent)
    );

    const tableStartY = startY + 25;

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: tableStartY,
      margin: { top: 60 },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [0, 0, 0], // Black border
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [200, 200, 200], // Light gray
        textColor: 20,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      bodyStyles: {
        valign: "middle",
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
    });

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Units: ${totalCredits}`,
      pageWidthTitle - 80,
      tableStartY + 130,
      {
        align: "center",
      }
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Average: ${totalAverage}`,
      pageWidthTitle - 50,
      tableStartY + 130,
      {
        align: "center",
      }
    );

    // **Open print panel**
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  const GradeTable = ({
    filteredGrades,
  }: {
    filteredGrades: StudentGradeDetails[];
  }) => {
    // Compute final grades and remarks for each subject
    const computedGrades = filteredGrades.map((grade) => {
      const prelim = grade.terms.PRELIM || 0;
      const midterm = grade.terms.MIDTERM || 0;
      const final = grade.terms.FINAL || 0;

      const average = calculateAverage(prelim, midterm, final);
      const finalGrade = calculateEQ(average);
      const remark = getRemark(finalGrade);

      return {
        ...grade,
        finalGrade,
        remark,
      };
    });

    return (
      <>
        <table className={styles.studentTable} id="studentTable">
          <thead>
            <tr>
              <th>#</th>
              <th>SUBJECT CODE</th>
              <th>SUBJECT DESCRIPTION</th>
              <th>CREDITS</th>
              <th>GRADE</th>
              <th>REMARK</th>
            </tr>
          </thead>
          <tbody>
            {computedGrades.map((grade, index) => (
              <tr key={grade._id}>
                <td>{index + 1}</td>
                <td>{grade.SubjectId}</td>
                <td>{grade.SubjectName || grade.SubjectId}</td>
                <td>{grade.Credits}</td>
                <td>{grade.finalGrade.toFixed(2)}</td>
                <td>{grade.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  const GradeSummary = ({
    filteredGrades,
  }: {
    filteredGrades: StudentGradeDetails[];
  }) => {
    // Calculate total units and average grade
    const { totalUnits, averageGrade } = useMemo(() => {
      let totalCredits = 0;
      let totalGradePoints = 0;
      let gradedSubjects = 0;

      filteredGrades.forEach((grade) => {
        const prelim = grade.terms.PRELIM || 0;
        const midterm = grade.terms.MIDTERM || 0;
        const final = grade.terms.FINAL || 0;

        const average = calculateAverage(prelim, midterm, final);
        const finalGrade = calculateEQ(average);

        totalCredits += grade.Credits || 0;

        // Only include in average if at least one term has a grade
        if (prelim > 0 || midterm > 0 || final > 0) {
          totalGradePoints += finalGrade * (grade.Credits || 0);
          gradedSubjects += grade.Credits || 0;
        }
      });

      const average =
        gradedSubjects > 0 ? totalGradePoints / gradedSubjects : 0;

      return {
        totalUnits: totalCredits,
        averageGrade: average.toFixed(2),
      };
    }, [filteredGrades]);

    setTotaCredits(totalUnits);
    setTotalAverage(averageGrade);
    return (
      <>
        <h4>Total Units: {totalUnits}</h4>
        <h4>Average: {averageGrade}</h4>
      </>
    );
  };

  return (
    <>
      <header
        className={styles.GradeViewing}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: "18px 40px",
        }}
      >
        <h3>Grade Viewing</h3>
        <button
          style={{
            backgroundColor: "#0F2A71",
            borderRadius: "10px",
          }}
          onClick={handlePrintPDF}
        >
          OPEN IN PDF
        </button>
      </header>
      <main style={{ width: "100%", maxHeight: "71vh", overflowY: "auto" }}>
        {studentDetails && (
          <section
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
              backgroundColor: "#EAECF0",
              padding: "25px",
            }}
            className={styles.studentInfo}
          >
            <img
              src={studentImg}
              alt="Your Picture"
              width={iconWH}
              height={iconWH}
            />
            <div>
              <div className={styles.studentTitle}>
                <p>Student Name</p>
                <h3>
                  {studentDetails.LastName}, {studentDetails.FirstName}{" "}
                  {studentDetails.MiddleInitial}.
                </h3>
              </div>
              <div className={styles.studentTitle}>
                <p>Student Number</p>
                <h3>{studentDetails._id}</h3>
              </div>
              <div className={styles.studentTitle}>
                <p>Academic Year</p>
                <select
                  value={selectedAcadYr}
                  onChange={(e) => setSelectedAcadYr(e.target.value)}
                  disabled={!academicYearOptions.length}
                >
                  {academicYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className={styles.studentTitle}>
                <p>Course</p>
                <h3>{courseName.toUpperCase()}</h3>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "60px",
                }}
              >
                <div className={styles.studentTitle}>
                  <p>Year Level</p>
                  <h3>{yearLevel}</h3>
                </div>
                <div className={styles.studentTitle}>
                  <p>Student Type</p>
                  <h3>{studentDetails.StudentType}</h3>
                </div>
              </div>
              <div className={styles.studentTitle}>
                <p>Semester</p>
                <select
                  value={selectedSem}
                  onChange={(e) => setSelectedSem(e.target.value)}
                  disabled={!semesterOptions.length}
                >
                  {semesterOptions.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}
        <section style={{ maxWidth: "100%", padding: "30px" }}>
          {loading ? (
            <div className={styles.loading}>
              <h2>Loading.. Please Wait</h2>
              <video
                autoPlay
                loop
                muted
                className={styles.loadingHorizontal}
                height={50}
              >
                <source src={loadingHorizontal} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : filteredGrades.length > 0 ? (
            <GradeTable filteredGrades={filteredGrades} />
          ) : (
            <p>
              No grades found for {activeAcadYrs} - {activeSems} semester
            </p>
          )}
          <div
            style={{
              paddingTop: "40px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: "100px",
            }}
            className={styles.belowTable}
          >
            {loading ? (
              <div className={styles.loading}>
                <h2>Loading.. Please Wait</h2>
                <video
                  autoPlay
                  loop
                  muted
                  className={styles.loadingHorizontal}
                  height={50}
                >
                  <source src={loadingHorizontal} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : filteredGrades.length > 0 ? (
              <GradeSummary filteredGrades={filteredGrades} />
            ) : (
              <p>
                No grades found for {activeAcadYrs} - {activeSems} semester
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default GradeViewing;
