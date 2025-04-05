import { useContext, useEffect, useState } from "react";
import styles from "../styles/AuditTrail.module.scss"; // Import CSS module
import jsPDF from "jspdf";
import cslogo from "../../../../assets/images/ccs_icon.png";
import nclogo from "../../../../assets/images/nc_logo.png";
import loadingHorizontal from "../../../../assets/webM/loadingHorizontal.webm";
import autoTable from "jspdf-autotable";
import { UserContext } from "../../../../context/UserContext";
import { API } from "@/context/axiosInstance";

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
  const [error, setError] = useState<boolean>(false);

  // Filter states
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const logsPerPage = 20;

  const context = useContext(UserContext);

  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      setAuditLogs([]);
      setErrorMessage("");
      try {
        const response = await API.post("/user/getAuditUsers", {
          page: currentPage,
          limit: logsPerPage,
          action: filterAction,
          userId: filterUser,
          startDate: filterStartDate,
          endDate: filterEndDate,
        });

        if (response.data.success) {
          setAuditLogs(response.data.logs);
          setTotalPages(response.data.totalPages);
        } else {
          setErrorMessage(response.data.message || "No logs found.");
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        setErrorMessage("An error occurred while fetching logs.");
        setError(true);
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

    // Load logos
    const leftLogo = await loadImage(nclogo);
    const rightLogo = await loadImage(cslogo);

    // Add logos and header text
    doc.addImage(leftLogo, "PNG", 20, 10, 28, 28);
    doc.addImage(rightLogo, "PNG", 160, 10, 30, 30);

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

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 60,
      margin: { top: 60 },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    // **Add Generated Date (Bottom Left) & Prepared By (Bottom Right)**
    const currentDate = new Date().toLocaleString(); // Get current date & time
    const preparedBy = `Prepared by: ${user?.refId} - ${user?.name}`; // User details

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(10);
    doc.text(`Generated Date: ${currentDate}`, 20, pageHeight - 10);
    doc.text(
      preparedBy,
      pageWidth - doc.getTextWidth(preparedBy) - 20,
      pageHeight - 10
    );

    // **Open print panel**
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
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
            <option value="User Archived">User Archived</option>
            <option value="Subject Archived">Subject Archived</option>
            <option value="User Restored">User Restored</option>
            <option value="Subject Restored">Subject Restored</option>
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
          OPEN IN PDF
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
              {error ? (
                <>
                  <h2>{errorMessage}</h2>
                </>
              ) : loading ? (
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
