import { useEffect, useState } from "react";
import styles from "../styles/AuditTrail.module.scss"; // Import CSS module
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import cslogo from "../../../../assets/images/ccs_icon.png";
import nclogo from "../../../../assets/images/nc_logo.png";
import loadingHorizontal from "../../../../assets/webM/loadingHorizontal.webm";
import axios from "axios";
import autoTable from "jspdf-autotable";

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
  const logsPerPage = 20;

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

  const loadImage = async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  };

  const handlePrintPDF = async () => {
    const doc = new jsPDF();

    // Load logos (replace with your actual logo imports/URLs)
    const leftLogo = await loadImage(nclogo);
    const rightLogo = await loadImage(cslogo);

    // Add logos and header text
    doc.addImage(leftLogo, "PNG", 20, 10, 28, 28); // Left logo
    doc.addImage(rightLogo, "PNG", 160, 10, 30, 30); // Right logo

    // Title and institution info
    doc.setFontSize(14);
    doc.setFont("calibri", "bold");
    doc.text("NORZAGARAY COLLEGE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("calibri", "normal");
    doc.text("Municipal Compound, Poblacion, Norzagaray, Bulacan", 105, 27, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.text("MIS Department", 105, 34, { align: "center" });

    // Report title
    doc.setFontSize(16);
    doc.text("Audit Trail Report", 105, 50, { align: "center" });

    // Extract table data
    const headers = Array.from(document.querySelectorAll("#logTable th")).map(
      (th) => th.textContent
    );
    const rows = Array.from(
      document.querySelectorAll("#logTable tbody tr")
    ).map((tr) =>
      Array.from(tr.querySelectorAll("td")).map((td) => td.textContent)
    );

    // Add table (starts below the header)
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 60, // Position below the header
      margin: { top: 60 },
      styles: { fontSize: 8 }, // Smaller font for table
      headStyles: { fillColor: [22, 160, 133] }, // Green header
    });

    // Footer with date
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 14, doc.internal.pageSize.height - 10);

    doc.save(`AuditTrailReport-${date}.pdf`);
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
            <option value="Grade Updated">Grade Updated</option>
            <option value="Bulk Grade Update">Bulk Grade Update</option>
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

      <div id="pdfContent">
        <div
          id="pdfHeader"
          style={{ textAlign: "center", marginBottom: "20px", display: "none" }}
        >
          <img
            src={nclogo}
            alt="NC Logo"
            style={{
              width: "100px",
              height: "100px",
              float: "left",
              paddingLeft: "100px",
            }}
          />
          <img
            src={cslogo}
            alt="CCS Logo"
            style={{
              width: "100px",
              height: "100px",
              float: "right",
              paddingRight: "100px",
            }}
          />

          <h2>NORZAGARAY COLLEGE</h2>
          <p>Municipal Compound, Poblacion, Norzagaray, Bulacan</p>
          <h3>MIS Department</h3>
          <h4>Audit Trail Report</h4>
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
                  <td colSpan={6}>
                    {loading ? "Loading..." : "No logs found."}
                  </td>
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
