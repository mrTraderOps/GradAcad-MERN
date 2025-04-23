import styles from "../styles/MainPage.module.scss";
import { useContext, useEffect, useState } from "react";
import { Props } from "../../../../models/types/Props";
import { useSubjectsV2 } from "../../../../hooks/useSubjects";
import { GenerateReport } from "../../../components/GenerateReport";
import { UserContext } from "../../../../context/UserContext";
import API from "../../../../context/axiosInstance";
import ccs from "../../../../assets/images/ccs_logo.png";
import hm from "../../../../assets/images/hm.png";
import safe from "../../../../assets/images/safe_logo.png";
import Ratio from "./dashboard_panel/Ratios";
import GradeDistribution from "./dashboard_panel/GradeDistribution";

interface GroupedSubject {
  subjectCode: string;
  sections: Set<string>;
  totalEnrolled: number;
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
  const [isPageOne, setIsPageOne] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState<AccountSummary[]>([]);

  const iconWH = 45;

  const context = useContext(UserContext);

  const { user }: any = context;

  if (!context) {
    throw new Error("User role can't read");
  }

  const { subjects } = useSubjectsV2(user.refId, undefined, undefined, {
    enabled: true,
  });

  const groupedSubjects = subjects.reduce<Record<string, GroupedSubject>>(
    (acc, subject) => {
      const { subjectCode, section, enrolledStudents } = subject;

      if (!acc[subjectCode]) {
        acc[subjectCode] = {
          subjectCode,
          sections: new Set(),
          totalEnrolled: 0,
        };
      }

      acc[subjectCode].totalEnrolled += Number(enrolledStudents);
      acc[subjectCode].sections.add(section);

      return acc;
    },
    {}
  );

  const tableData = Object.values(groupedSubjects).map((subject) => ({
    subjectCode: subject.subjectCode,
    sectionCount: subject.sections.size,
    totalEnrolled: subject.totalEnrolled,
  }));

  // Current Time
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

  // Role Greeting
  useEffect(() => {
    if (userRole === "prof") {
      setRoleName("");
    } else if (userRole === "admin") {
      setRoleName("MIS");
    } else if (userRole === "registrar") {
      setRoleName("REGISTRAR");
    } else if (userRole === "dean") {
      setRoleName("DEAN");
    }
  }, [userRole]);

  // Account Summary
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

  const handleCancelSubmit = () => {
    setShowModal(false);
  };

  const setPage = () => {
    setIsPageOne((prev) => !prev);
  };

  return (
    <>
      <div className={styles.Dashboard}>
        <section className={styles.section1}>
          <div className={styles.dashboard1}>
            <div className={styles.greetings}>
              {user.role === "prof" ? (
                <h4>WELCOME,</h4>
              ) : (
                <h4>WELCOME {roleName},</h4>
              )}

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
              {user ? (
                isPageOne ? (
                  <GradeDistribution setIsPageOne={setPage} />
                ) : (
                  <Ratio setIsPageOne={setPage} />
                )
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
                            <td className={styles.gwa}>
                              {subject.totalEnrolled}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              <div className={styles.nc_logo_name} style={{ width: "100%" }}>
                <div
                  className={styles.nc_org}
                  style={{
                    justifyContent: "space-between",
                    width: "100%",
                    paddingBottom: "2rem",
                  }}
                >
                  <div>
                    <h2>©2025 GradAcad Inc.| All rights reserved</h2>
                  </div>
                  <div className={styles.nc_org}>
                    <img src={ccs} alt="" width={iconWH} height={iconWH} />
                    <img
                      src={hm}
                      alt=""
                      width={iconWH - 1}
                      height={iconWH - 1}
                    />
                    <img src={safe} alt="" width={iconWH} height={iconWH} />
                  </div>
                </div>
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
