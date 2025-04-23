import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../../context/UserContext";
import styles from "../../styles/MainPage.module.scss";
import { useSubjectsV2 } from "../../../../../hooks/useSubjects";
import { GradeData } from "../../../../../models/types/GradeData";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import API from "../../../../../context/axiosInstance";
import { useTerm } from "../../../../../hooks/useTerm";
import arrow from "../../../../../assets/icons/right-arrow.png";

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

interface Props {
  setIsPageOne: () => void;
}

const Ratio = ({ setIsPageOne }: Props) => {
  const context = useContext(UserContext);

  const { user }: any = context;

  if (!context) {
    throw new Error("User role can't read");
  }

  const { initialAcadYr, initialSem } = useTerm();

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedAcadYr, setSelectedAcadYr] = useState<string>(initialAcadYr);
  const [selectedSem, setSelectedSem] = useState<string>(initialSem);
  const [insight, setInsight] = useState<string>("");
  const [interpret, setInterpret] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [pendingCount, setPendingCount] = useState();
  const [approvedCount, setApprovedCount] = useState();

  const [grades, setGrades] = useState<GradeData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user.role !== "admin") return;

    const fetchAccountCounts = async () => {
      try {
        const response = await API.get("/user/pendingApprovedUsers");

        if (response.data.success) {
          // Set the state with fetched data
          setPendingCount(response.data.totalPending);
          setApprovedCount(response.data.totalApproved);
        } else {
          setErrorMessage("Failed to fetch account counts");
        }
      } catch (error) {
        console.error("Error fetching account counts:", error);
        setErrorMessage("An error occurred while fetching account counts.");
      }
    };

    fetchAccountCounts();
  }, []);

  // 1. Initialization effect
  useEffect(() => {
    // Set initial values from props
    setSelectedAcadYr(initialAcadYr);
    setSelectedSem(initialSem);

    // Mark initialization as complete
    setIsInitialized(true);

    // Cleanup function
    return () => {
      setIsInitialized(false);
    };
  }, [initialAcadYr, initialSem]);

  const { subjects } = useSubjectsV2(user.refId, undefined, undefined, {
    enabled: isInitialized,
  });

  const uniqueAcadYrs = [...new Set(subjects.map((subject) => subject.acadYr))];
  const uniqueSems = [...new Set(subjects.map((subject) => subject.sem))];
  const uniqueSections = [
    ...new Set(
      subjects
        .filter(
          (subject) =>
            (selectedAcadYr === "" || subject.acadYr === selectedAcadYr) &&
            (selectedSem === "" || subject.sem === selectedSem)
        )
        .map((subject) => `${subject.dept} - ${subject.section}`)
    ),
  ];

  const filteredSubjects =
    selectedAcadYr || selectedSem
      ? [
          ...new Set(
            subjects
              .filter(
                (subject) =>
                  (selectedAcadYr === "" ||
                    subject.acadYr === selectedAcadYr) &&
                  (selectedSem === "" || subject.sem === selectedSem)
              )
              .map((subject) => subject.subjectCode)
          ),
        ]
      : [...new Set(subjects.map((subject) => subject.subjectCode))];

  const filteredSections =
    selectedSubject === ""
      ? uniqueSections
      : [
          ...new Set(
            subjects
              .filter(
                (subject) =>
                  subject.subjectCode === selectedSubject &&
                  (selectedAcadYr === "" ||
                    subject.acadYr === selectedAcadYr) &&
                  (selectedSem === "" || subject.sem === selectedSem)
              )
              .map((subject) => `${subject.dept} - ${subject.section}`)
          ),
        ];

  const calculatePassFail = (grades: GradeData[]) => {
    const studentAverages = grades.map((grade) => {
      const { PRELIM, MIDTERM, FINAL } = grade.terms;

      const termCount = [PRELIM, MIDTERM, FINAL].filter(
        (term) => term !== undefined
      ).length;

      const sum = (PRELIM || 0) + (MIDTERM || 0) + (FINAL || 0);

      const average = termCount > 0 ? sum / termCount : 0;

      return { ...grade, average };
    });

    const totalStudents = studentAverages.length;
    const passedStudents = studentAverages.filter(
      (student) => student.average >= 75
    ).length;
    const failedStudents = totalStudents - passedStudents;

    // Calculate pass/fail percentages
    const passPercentage = ((passedStudents / totalStudents) * 100).toFixed(2);
    const failPercentage = ((failedStudents / totalStudents) * 100).toFixed(2);

    return [
      { name: "Passed", value: parseFloat(passPercentage) },
      { name: "Failed", value: parseFloat(failPercentage) },
    ];
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: LabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="#0F2A71"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`} {/* Add "%" symbol */}
      </text>
    );
  };

  const handleAcadYrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    setSelectedAcadYr(selectedValue);
    setSelectedSubject("");
    setSelectedSection("");
  };

  const handleSemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    setSelectedSem(selectedValue);
    setSelectedSubject("");
    setSelectedSection("");
  };

  const data = [
    { name: "Pending Users", value: pendingCount },
    { name: "Approved Users", value: approvedCount },
  ];

  const pieData = calculatePassFail(grades);

  const COLORS = ["#3bc43d", "#ec7d38"]; // soft green, soft red

  const COLORS2 = ["#FF8042", "#00C49F"];

  useEffect(() => {
    if (user.role !== "prof") return;

    const [dept, sect] = selectedSection.split(" - ");
    const subjCode = selectedSubject || "";

    const fetchGrades = async () => {
      try {
        const response = await API.post("/grade/getStudentGradesV2", {
          refId: user.refId,
          acadYr: selectedAcadYr,
          sem: selectedSem,
          dept,
          sect,
          subjectId: subjCode,
        });

        if (response.data.success) {
          const fetchedGrades = response.data.data;
          setGrades(fetchedGrades);

          const pieData = calculatePassFail(fetchedGrades);

          const botResponse = await API.post("/bot/pieChatBot", { pieData });

          if (botResponse.data.success) {
            setInterpret(botResponse.data.interpret);
            setInsight(botResponse.data.insight);
            setErrorMessage("");
          } else {
            setErrorMessage("Failed to give interpretation and insight.");
          }
        } else {
          setGrades([]);
          setErrorMessage("No grade records found.");
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
        setErrorMessage("Loading...");
      }
    };

    fetchGrades();
  }, [selectedAcadYr, selectedSem, selectedSection, selectedSubject]);

  return (
    <div>
      {user.role === "prof" ? (
        <div>
          <p>PASSED & FAILED RATIO</p>
          <div className={styles.selectCont}>
            <p>A.Y:</p>
            <select
              className={styles.sortSelect}
              value={selectedAcadYr}
              onChange={handleAcadYrChange}
            >
              {uniqueAcadYrs.map((acadYr, index) => (
                <option key={index} value={acadYr}>
                  {acadYr}
                </option>
              ))}
            </select>

            <p>SEM:</p>
            <select
              className={styles.sortSelect}
              value={selectedSem}
              onChange={handleSemChange}
            >
              {uniqueSems.map((sem, index) => (
                <option key={index} value={sem}>
                  {sem}
                </option>
              ))}
            </select>

            <p>SUBJECT:</p>
            <select
              className={styles.sortSelect}
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedSection("");
              }}
              disabled={selectedAcadYr === "" && selectedSem === ""}
            >
              <option value="">ALL</option>
              {filteredSubjects.map((subjectCode, index) => (
                <option key={index} value={subjectCode}>
                  {subjectCode}
                </option>
              ))}
            </select>

            <p>SECTION:</p>
            <select
              className={styles.sortSelect}
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
              }}
              disabled={selectedSubject === ""}
            >
              <option value="">ALL</option>
              {filteredSections.map((section, index) => (
                <option key={index} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.tableAnalytics}>
            <div
              className={styles.chartContainer}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginRight: "1rem",
              }}
            >
              <ResponsiveContainer width="60%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={renderCustomizedLabel} // Use custom label
                    labelLine={false}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value}%`} // Add "%" to tooltip
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  flexDirection: "column",
                  paddingRight: "1rem",
                  gap: "1rem",
                }}
              >
                {errorMessage === "" ? (
                  <>
                    <p>
                      <strong>Interpretation: </strong> {interpret}
                    </p>
                    <p>
                      <strong>Insight: </strong> {insight}
                    </p>
                  </>
                ) : (
                  <p>{errorMessage}</p>
                )}
              </div>
              {user.role === "prof" && (
                <img
                  src={arrow}
                  alt="analytics"
                  width={20}
                  height={20}
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsPageOne()}
                />
              )}
            </div>
          </div>
        </div>
      ) : user.role === "admin" ? (
        <div>
          <p>TOTAL PENDING AND APPROVED ACCOUNTS</p>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%" // Center X
                  cy="50%" // Center Y
                  innerRadius={30} // Donut style
                  outerRadius={100} // Size of Pie
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {data.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS2[index % COLORS2.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div>
          <p>You do not have access to this panel.</p>
        </div>
      )}
    </div>
  );
};

export default Ratio;
