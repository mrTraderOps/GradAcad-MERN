import styles from "../styles/MainPage.module.scss";
import { useEffect, useState } from "react";
import { Props } from "../../../../models/types/Props";

const Dashboard = ({ LoggedName }: Props) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

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
  return (
    <div className={styles.Dashboard}>
      <section className={styles.section1}>
        <div className={styles.dashboard1}>
          <div className={styles.greetings}>
            <h4>WELCOME</h4>
            <p>Sir {LoggedName}</p>
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
            <p>STUDENT GRADE RANKING</p>
            <div className={styles.selectCont}>
              <p>SECTION : </p>
              <select className={styles.sortSelect}>
                <option value="0">ALL</option>
              </select>
              <p>SUBJECT : </p>
              <select className={styles.sortSelect}>
                <option value="0">ALL</option>
              </select>
            </div>
            <div className={styles.tableAnalytics}>
              <div className={styles.tableContainer}>
                <table>
                  <thead>
                    <tr>
                      <th>STUDENT ID</th>
                      <th>NAME</th>
                      <th className={styles.gwa}>GRADE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2021-0079</td>
                      <td>PERALTA, WINZKATE H.</td>
                      <td className={styles.gwa}>98.3</td>
                    </tr>
                    <tr>
                      <td>2020-0019</td>
                      <td>VERZON, EARL GIERALD B.</td>
                      <td className={styles.gwa}>97.2</td>
                    </tr>
                    <tr>
                      <td>2021-0081</td>
                      <td>DUMALAOG, ALEXIS JHUDIEL N.</td>
                      <td className={styles.gwa}>96.8</td>
                    </tr>
                    <tr>
                      <td>2021-0081</td>
                      <td>TIMPOG, MARK DAVID G.</td>
                      <td className={styles.gwa}>95.2</td>
                    </tr>
                    <tr>
                      <td>2021-0081</td>
                      <td>VASQUEZ, JOHN PAUL P.</td>
                      <td className={styles.gwa}>93.7</td>
                    </tr>
                    <tr>
                      <td>2021-0081</td>
                      <td>DUMALAOG, ALEXIS JHUDIEL N.</td>
                      <td className={styles.gwa}>96.8</td>
                    </tr>
                    <tr>
                      <td>2021-0081</td>
                      <td>DUMALAOG, ALEXIS JHUDIEL N.</td>
                      <td className={styles.gwa}>96.8</td>
                    </tr>
                    <tr>
                      <td>2021-0081</td>
                      <td>DUMALAOG, ALEXIS JHUDIEL N.</td>
                      <td className={styles.gwa}>96.8</td>
                    </tr>
                    <tr>
                      <td>2021-0081</td>
                      <td>DUMALAOG, ALEXIS JHUDIEL N.</td>
                      <td className={styles.gwa}>96.8</td>
                    </tr>
                    <tr>
                      <td>2021-0081</td>
                      <td>DUMALAOG, ALEXIS JHUDIEL N.</td>
                      <td className={styles.gwa}>96.8</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.courseSum}>
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
                    <tr>
                      <td>FRELEC103</td>
                      <td>2</td>
                      <td className={styles.gwa}>64</td>
                    </tr>
                    <tr>
                      <td>FL101</td>
                      <td>2</td>
                      <td className={styles.gwa}>58</td>
                    </tr>
                    <tr>
                      <td>ENVISCI</td>
                      <td>8</td>
                      <td className={styles.gwa}>364</td>
                    </tr>
                    <tr>
                      <td>PATHFIT101</td>
                      <td>8</td>
                      <td className={styles.gwa}>387</td>
                    </tr>
                    <tr>
                      <td>CSC5</td>
                      <td>3</td>
                      <td className={styles.gwa}>98</td>
                    </tr>
                    <tr>
                      <td>THS101</td>
                      <td>7</td>
                      <td className={styles.gwa}>324</td>
                    </tr>
                    <tr>
                      <td>RES101</td>
                      <td>8</td>
                      <td className={styles.gwa}>278</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.shortCut}>
              <div>
                {/* <button>
                                        <p>Create Subject/s</p>
                                        <img src="src\assets\icons\add_subject.png" width={20} height={20} alt=""/>
                                    </button>
                                    <button>
                                        <p>Add Student/s</p>
                                        <img src="src\assets\icons\add_student.png" width={20} height={20} alt=""/>
                                    </button> */}
                <button>
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
  );
};

export default Dashboard;
