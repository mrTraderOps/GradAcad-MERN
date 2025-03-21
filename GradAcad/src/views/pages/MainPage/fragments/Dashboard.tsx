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
import { useSubjects, useSubjectsV2 } from "../../../../hooks/useSubjects";
import { StudentGradeAll } from "../../../../services/StudentService";
import { GradeData } from "../../../../models/types/GradeData";
import { GenerateReport } from "../../../components/GenerateReport";
import { UserContext } from "../../../../context/UserContext";

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

const Dashboard = ({ LoggedName, userRole, LoggeduserName }: Props) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("0");
  const [selectedSection, setSelectedSection] = useState("0");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [showModal, setShowModal] = useState(false);

  const context = useContext(UserContext);

  const { user }: any = context;

  if (!context) {
    throw new Error("User role can't read");
  }

  const { subjects } = useSubjectsV2(user.refId);

  const uniqueSections = [
    ...new Set(
      subjects.map((subject) => `${subject.dept} - ${subject.section}`)
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
                  `${subject.dept} - ${subject.section}` === selectedSection
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
              .filter((subject) => subject.subjectCode === selectedSubject)
              .map((subject) => `${subject.dept} - ${subject.section}`)
          ),
        ];

  useEffect(() => {
    if (!selectedSection || !selectedSubject) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }

    setLoading(true);

    const [dept, sect] = selectedSection.split(" - ");
    const subjCode = selectedSubject === "0" ? "" : selectedSubject;

    StudentGradeAll(
      dept,
      sect,
      subjCode,
      setGrades,
      (error: string) => {
        setError(error);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
  }, [selectedSection, selectedSubject]);

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
      setRoleName("ADMIN");
    } else {
      setRoleName("");
    }
  }, [userRole]);

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
    index,
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

  return (
    <>
      <div className={styles.Dashboard}>
        <section className={styles.section1}>
          <div className={styles.dashboard1}>
            <div className={styles.greetings}>
              <h4>WELCOME {roleName},</h4>
              <p>
                {user?.role === "registrar" ? "Ma'am" : "Sir"} {LoggedName}
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
                    <p>A.Y : </p>
                    <select
                      className={styles.sortSelect}
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                      }}
                    >
                      <option value="0">ALL</option>
                      {filteredSubjects.map((subjectCode, index) => (
                        <option key={index} value={subjectCode}>
                          {subjectCode}
                        </option>
                      ))}
                    </select>
                    <p>SEM : </p>
                    <select
                      className={styles.sortSelect}
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                      }}
                    >
                      <option value="0">ALL</option>
                      {filteredSubjects.map((subjectCode, index) => (
                        <option key={index} value={subjectCode}>
                          {subjectCode}
                        </option>
                      ))}
                    </select>

                    <p>SUBJECT : </p>
                    <select
                      className={styles.sortSelect}
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                      }}
                    >
                      <option value="0">ALL</option>
                      {filteredSubjects.map((subjectCode, index) => (
                        <option key={index} value={subjectCode}>
                          {subjectCode}
                        </option>
                      ))}
                    </select>
                    <p>SECTION : </p>
                    <select
                      className={styles.sortSelect}
                      value={selectedSection}
                      onChange={(e) => {
                        setSelectedSection(e.target.value);
                        setSelectedSubject("0");
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
                            {pieData.map((entry, index) => (
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
                    <p>Pending Accounts: 10</p>
                    <p>Approved Accounts: 50</p>
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
                            <td className={styles.gwa}>-</td>{" "}
                            {/* Placeholder for total students */}
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
                <div className={styles.tableAnalytics}>
                  <div className={styles.tableContainer}>
                    <table>
                      <thead>
                        <tr>
                          <th>ACCOUNT TYPE</th>
                          <th>STATUS</th>
                          <th className={styles.gwa}>TOTAL ACCOUNTS</th>{" "}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Student</td>
                          <td>Active</td>
                          <td className={styles.gwa}>150</td>
                        </tr>
                        <tr>
                          <td>Student</td>
                          <td>Pending</td>
                          <td className={styles.gwa}>20</td>
                        </tr>
                        <tr>
                          <td>Professor</td>
                          <td>Active</td>
                          <td className={styles.gwa}>30</td>
                        </tr>
                        <tr>
                          <td>Admin</td>
                          <td>Active</td>
                          <td className={styles.gwa}>5</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={styles.shortCut}>
                  <div>
                    <button onClick={() => {}}>
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
              <div className={styles.nc_logo_name}>
                <img
                  src="src\assets\images\nc_logo.png"
                  alt=""
                  width={45}
                  height={45}
                />
                <h2>NORZAGARAY COLLEGE</h2>
              </div>
              <div className={styles.nc_org}>
                <img
                  src="src\assets\images\ccs_logo.png"
                  alt=""
                  width={35}
                  height={35}
                />
                <img
                  src="src\assets\images\charms_logo.png"
                  alt=""
                  width={35}
                  height={35}
                />
                <img
                  src="src\assets\images\safe_logo.png"
                  alt=""
                  width={35}
                  height={35}
                />
              </div>
              <button className={styles.concerns}>
                <p>CONCERNS AND QUESTIONS?</p>
              </button>
            </div>
          </footer>
        </section>
      </div>
      <GenerateReport
        isOpen={showModal}
        onCancel={handleCancelSubmit}
        loggedUserName={LoggeduserName ?? ""}
      />
    </>
  );
};

export default Dashboard;
