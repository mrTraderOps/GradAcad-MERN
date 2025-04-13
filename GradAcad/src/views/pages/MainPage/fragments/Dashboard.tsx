import styles from "../styles/MainPage.module.scss";
import { useContext, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Props } from "../../../../models/types/Props";
import { useSubjectsV2 } from "../../../../hooks/useSubjects";
import { StudentGradeAll } from "../../../../services/StudentService";
import { GradeData } from "../../../../models/types/GradeData";
import { GenerateReport } from "../../../components/GenerateReport";
import { UserContext } from "../../../../context/UserContext";
import API from "../../../../context/axiosInstance";

interface GroupedSubject {
  subjectCode: string;
  sections: Set<string>;
}

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

interface AccountSummary {
  accountType: string;
  status: string;
  total: number;
}

const Dashboard = ({ LoggedName, userRole }: Props) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("0");
  const [selectedSection, setSelectedSection] = useState("0");
  const [selectedAcadYr, setSelectedAcadYr] = useState("0");
  const [selectedSem, setSelectedSem] = useState("0");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingCount, setPendingCount] = useState();
  const [approvedCount, setApprovedCount] = useState();
  const [summary, setSummary] = useState<AccountSummary[]>([]);

  const iconWH = 30;

  const context = useContext(UserContext);

  const { user }: any = context;

  if (!context) {
    throw new Error("User role can't read");
  }

  const subjects =
    user?.role === "prof" ? useSubjectsV2(user.refId).subjects : [];

  const uniqueAcadYrs = [...new Set(subjects.map((subject) => subject.acadYr))];
  const uniqueSems = [...new Set(subjects.map((subject) => subject.sem))];

  const uniqueSections = [
    ...new Set(
      subjects
        .filter(
          (subject) =>
            (selectedAcadYr === "0" || subject.acadYr === selectedAcadYr) &&
            (selectedSem === "0" || subject.sem === selectedSem)
        )
        .map((subject) => `${subject.dept} - ${subject.section}`)
    ),
  ];

  const filteredSubjects =
    selectedSection === "0"
      ? [...new Set(subjects.map((subject) => subject.subjectCode))]
      : [
          ...new Set(
            subjects
              .filter(
                (subject) =>
                  `${subject.dept} - ${subject.section}` === selectedSection &&
                  (selectedAcadYr === "0" ||
                    subject.acadYr === selectedAcadYr) &&
                  (selectedSem === "0" || subject.sem === selectedSem)
              )
              .map((subject) => subject.subjectCode)
          ),
        ];

  const filteredSections =
    selectedSubject === "0"
      ? uniqueSections
      : [
          ...new Set(
            subjects
              .filter(
                (subject) =>
                  subject.subjectCode === selectedSubject &&
                  (selectedAcadYr === "0" ||
                    subject.acadYr === selectedAcadYr) &&
                  (selectedSem === "0" || subject.sem === selectedSem)
              )
              .map((subject) => `${subject.dept} - ${subject.section}`)
          ),
        ];

  // Sync Selected Values
  useEffect(() => {
    setSelectedAcadYr("0");
    setSelectedSem("0");
    setSelectedSubject("0");
    setSelectedSection("0");
  }, [subjects]);

  useEffect(() => {
    if (
      !selectedAcadYr ||
      !selectedSem ||
      !selectedSection ||
      !selectedSubject ||
      user.role !== "prof"
    ) {
      return;
    }

    const [dept, sect] = selectedSection.split(" - ");
    const subjCode = selectedSubject === "0" ? "" : selectedSubject;

    StudentGradeAll(
      selectedAcadYr,
      selectedSem,
      dept,
      sect,
      subjCode,
      setGrades,
      (error: string) => {
        setErrorMessage(error);
      }
    );
  }, [selectedAcadYr, selectedSem, selectedSection, selectedSubject]);

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

  const pieData = calculatePassFail(grades);

  const COLORS = ["#00C49F", "#FF8042"];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
      };
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Manila",
      };

      const formattedTime = new Intl.DateTimeFormat(
        "en-US",
        timeOptions
      ).format(now);
      const formattedDate = new Intl.DateTimeFormat(
        "en-US",
        dateOptions
      ).format(now);

      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userRole === "prof") {
      setRoleName("INSTRUCTOR");
    } else if (userRole === "admin") {
      setRoleName("MIS");
    } else if (userRole === "registrar") {
      setRoleName("REGISTRAR");
    } else if (userRole === "dean") {
      setRoleName("DEAN");
    }
  }, [userRole]);

  //Pending Approved Users
  useEffect(() => {
    // Fetch the total pending and approved accounts
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

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await API.get("/user/accountSummary");
        if (response.data.success) {
          setSummary(response.data.summary);
        } else {
          setErrorMessage(response.data.message || "Failed to fetch data.");
        }
      } catch (error) {
        console.error("Error fetching account summary:", error);
      }
    };

    fetchSummary();
  }, []);

  const groupedSubjects = subjects.reduce<Record<string, GroupedSubject>>(
    (acc, subject) => {
      const { subjectCode, section } = subject;

      if (!acc[subjectCode]) {
        acc[subjectCode] = {
          subjectCode,
          sections: new Set(),
        };
      }

      acc[subjectCode].sections.add(section);

      return acc;
    },
    {}
  );

  const tableData = Object.values(groupedSubjects).map((subject) => ({
    subjectCode: subject.subjectCode,
    sectionCount: subject.sections.size,
  }));

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

  const handleCancelSubmit = () => {
    setShowModal(false);
  };

  const data = [
    { name: "Pending Users", value: pendingCount },
    { name: "Approved Users", value: approvedCount },
  ];

  const COLORS2 = ["#FF8042", "#00C49F"]; // 🔥 Orange for Pending, Green for Approved

  return (
    <>
      <div className={styles.Dashboard}>
        <section className={styles.section1}>
          <div className={styles.dashboard1}>
            <div className={styles.greetings}>
              <h4>WELCOME {roleName},</h4>
              <p>
                {user?.role === "registrar" ? "Ma'am" : ""} {LoggedName}
              </p>
            </div>

            <div className={styles.timeDay}>
              <p>{currentTime}</p>
              <p>{currentDate}</p>
            </div>
          </div>
        </section>

        <section className={styles.section2}>
          <div className={styles.analytics}>
            <div>
              {user?.role === "prof" ? (
                <div>
                  <p>PERFORMANCE ANALYTICS</p>
                  <div className={styles.selectCont}>
                    <p>A.Y:</p>
                    <select
                      className={styles.sortSelect}
                      value={selectedAcadYr}
                      onChange={(e) => {
                        setSelectedAcadYr(e.target.value);
                        setSelectedSem("0");
                        setSelectedSection("0");
                        setSelectedSubject("0");
                      }}
                    >
                      <option value="0">ALL</option>
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
                      onChange={(e) => {
                        setSelectedSem(e.target.value);
                        setSelectedSection("0");
                        setSelectedSubject("0");
                      }}
                    >
                      <option value="0">ALL</option>
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
                        setSelectedSection("0");
                      }}
                    >
                      <option value="0">ALL</option>
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
                    >
                      <option value="0">ALL</option>
                      {filteredSections.map((section, index) => (
                        <option key={index} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.tableAnalytics}>
                    <div className={styles.chartContainer}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
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
                    </div>
                  </div>
                </div>
              ) : user?.role === "admin" ? (
                <div>
                  <p>TOTAL PENDING AND APPROVED ACCOUNTS</p>
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%" // Center X
                          cy="50%" // Center Y
                          innerRadius={60} // Donut style
                          outerRadius={100} // Size of Pie
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {data.map((_entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS2[index % COLORS.length]}
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
          </div>
          <div className={styles.courseSum}>
            {user?.role === "prof" ? (
              <div>
                <p>COURSE SUMMARY</p>
                <div className={styles.tableAnalytics}>
                  <div className={styles.tableContainer}>
                    <table>
                      <thead>
                        <tr>
                          <th>SUBJECT CODE</th>
                          <th>SECTIONS</th>
                          <th className={styles.gwa}>TOTAL STUDENTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((subject, index) => (
                          <tr key={index}>
                            <td>{subject.subjectCode}</td>
                            <td>{subject.sectionCount}</td>
                            <td className={styles.gwa}>-</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={styles.shortCut}>
                  <div>
                    <button onClick={() => setShowModal(true)}>
                      <p>Generate Report</p>
                      <img
                        src="src\assets\icons\generate_report.png"
                        width={20}
                        height={20}
                        alt=""
                      />
                    </button>
                  </div>
                </div>
              </div>
            ) : user?.role === "admin" ? (
              <div>
                <p>ACCOUNT SUMMARY</p>
                <div
                  className={styles.tableAnalytics}
                  style={{ height: "80%" }}
                >
                  <div
                    className={styles.tableContainer}
                    style={{ maxHeight: "clamp(100px, 45vh, 300px)" }}
                  >
                    <table>
                      <thead>
                        <tr>
                          <th>ACCOUNT TYPE</th>
                          <th>STATUS</th>
                          <th className={styles.gwa}>TOTAL ACCOUNTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {errorMessage && (
                          <>
                            <h2>{errorMessage}</h2>
                          </>
                        )}
                        {!errorMessage &&
                          summary.map((item, index) => (
                            <tr key={index}>
                              <td>{item.accountType}</td>
                              <td>{item.status}</td>
                              <td className={styles.gwa}>{item.total}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p>You do not have access to this panel.</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.section3}>
          <footer className={styles.nc_footer}>
            <div>
              <div>
                <h2>©2025 GradAcad Inc.| All rights reserved</h2>
              </div>
              <div className={styles.nc_org}>
                <img
                  src="src\assets\images\ccs_logo.png"
                  alt=""
                  width={iconWH}
                  height={iconWH}
                />
                <img
                  src="src\assets\images\hm.png"
                  alt=""
                  width={30}
                  height={30}
                />
                <img
                  src="src\assets\images\safe_logo.png"
                  alt=""
                  width={iconWH}
                  height={iconWH}
                />
              </div>
            </div>
          </footer>
        </section>
      </div>
      <GenerateReport
        isOpen={showModal}
        onCancel={handleCancelSubmit}
        userId={user.refId}
      />
    </>
  );
};

export default Dashboard;
