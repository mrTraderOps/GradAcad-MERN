import { useEffect, useState } from "react";
import styles from "../styles/AuditTrail.module.scss"; // Import CSS module
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import cslogo from "../../../../assets/images/ccs_icon.png";
import nclogo from "../../../../assets/images/nc_logo.png";
import loadingHorizontal from "../../../../assets/webM/loadingHorizontal.webm";
import axios from "axios";

interface AuditLog {
  logId: number;
  action: string;
  userId: string;
  name: string;
  date: string;
  details: string;
}

const AuditTrail = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Filter states
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const logsPerPage = 10;

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setAuditLogs([]);
      setErrorMessage("");
      try {
        const response = await axios.post(
          "http://localhost:5000/api/v1/user/getAuditUsers",
          {
            page: currentPage,
            limit: logsPerPage,
            action: filterAction,
            userId: filterUser,
            startDate: filterStartDate,
            endDate: filterEndDate,
          }
        );

        if (response.data.success) {
          setAuditLogs(response.data.logs);
          setTotalPages(response.data.totalPages);
        } else {
          setErrorMessage(response.data.message || "No logs found.");
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        setErrorMessage("An error occurred while fetching logs.");
      } finally {
        setTimeout(() => {
          setLoading(false); // Hide loading after delay
        }, 500);
      }
    };

    fetchAuditLogs();
  }, [currentPage, filterAction, filterUser, filterStartDate, filterEndDate]);

  // Handler functions remain the same
  const handleFilterActionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterAction(e.target.value);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterUser(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStartDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterStartDate(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterEndDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterEndDate(e.target.value);
    setCurrentPage(1);
  };

  // Function to print the table as a PDF
  const handlePrintPDF = () => {
    const input = document.getElementById("logTable"); // Select the table

    if (!input) return;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const leftImg = new Image();
      leftImg.src = nclogo; // Left logo (Norzagaray College)

      const rightImg = new Image();
      rightImg.src = cslogo; // Right logo (College of Computing Studies)

      leftImg.onload = () => {
        rightImg.onload = () => {
          // Insert Left Logo
          pdf.addImage(leftImg, "PNG", 20, 10, 28, 28); // Adjust size and position

          // Insert Right Logo
          pdf.addImage(rightImg, "PNG", 160, 10, 30, 30); // Adjust size and position

          // Insert Title
          pdf.setFontSize(14);
          pdf.setFont("calibri", "bold");
          pdf.text("NORZAGARAY COLLEGE", 105, 20, { align: "center" });

          pdf.setFontSize(12);
          pdf.setFont("calibri", "normal");
          pdf.text(
            "Municipal Compound, Poblacion, Norzagaray, Bulacan",
            105,
            27,
            {
              align: "center",
            }
          );

          pdf.setFontSize(12);
          pdf.setFont("calibri", "bold");
          pdf.text("MIS Department", 105, 34, { align: "center" });

          // Insert Report Title
          pdf.setFontSize(16);
          pdf.setFont("calibri", "bold");
          pdf.text("Audit Trail Report", 105, 50, { align: "center" });

          // Add the table image
          pdf.addImage(imgData, "PNG", 10, 60, 190, 0);

          const today = new Date();
          const formattedDate = `${today.getDate()}-${
            today.getMonth() + 1
          }-${today.getFullYear()}`;

          pdf.save(`AuditTrailReport_${formattedDate}.pdf`);
        };
      };
    });
  };

  return (
    <div className={styles.auditTrail}>
      <h2 style={{ textAlign: "center" }}>Audit Trail</h2>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label style={{ color: "black" }}>Action:</label>
          <select
            value={filterAction}
            onChange={handleFilterActionChange}
            style={{ width: "180px", height: "48px" }}
          >
            <option value="">All</option>
            <option value="Account Approved">Account Approved</option>
            <option value="Account Rejected">Account Rejected</option>
            <option value="User Edited">User Edited</option>
            <option value="User Deleted">User Deleted</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label style={{ color: "black" }}>User ID:</label>
          <input
            type="text"
            placeholder="Filter by user..."
            value={filterUser}
            onChange={handleFilterUserChange}
          />
        </div>
        <div className={styles.filterGroup}>
          <label style={{ color: "black" }}>Start Date:</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={handleFilterStartDateChange}
          />
        </div>
        <div className={styles.filterGroup}>
          <label style={{ color: "black" }}>End Date:</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={handleFilterEndDateChange}
          />
        </div>
        <button
          style={{
            alignSelf: "end",
            backgroundColor: "#0056b3",
            borderRadius: "7px",
            height: "50px",
          }}
          onClick={handlePrintPDF}
        >
          PRINT PDF
        </button>
      </div>

      {/* Audit Log Table */}
      <div id="logTable" className={styles.logTable}>
        <table className={styles.auditTable}>
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Action</th>
              <th>Actor User ID</th>
              <th>Actor Name</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <video
                  autoPlay
                  loop
                  muted
                  className={styles.loadingAnimation}
                  width={60}
                  style={{ marginLeft: "40px" }}
                >
                  <source src={loadingHorizontal} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </tr>
            ) : auditLogs.length === 0 ? (
              <tr>
                <td colSpan={6}>{loading ? "Loading..." : "No logs found."}</td>
              </tr>
            ) : (
              auditLogs.map((log, index) => (
                <tr
                  key={log.logId}
                  className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                >
                  <td>
                    <strong>{log.logId}</strong>
                  </td>
                  <td>{log.action}</td>
                  <td>{log.userId}</td>
                  <td>{log.name}</td>
                  <td>{log.date}</td>
                  <td>{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? styles.activePage : ""}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuditTrail;
