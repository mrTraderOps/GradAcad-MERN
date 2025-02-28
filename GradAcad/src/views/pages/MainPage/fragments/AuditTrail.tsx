import { useState } from "react";
import styles from "../styles/AuditTrail.module.scss"; // Import CSS module

interface AuditLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

const AuditTrail = () => {
  // State for audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 1,
      action: "Account Approved",
      user: "Admin",
      timestamp: "2023-10-01 10:00 AM",
      details:
        "Approved account for Earl Gierald B. Verzon (earlbandiola0403@gmail.com)",
    },
    {
      id: 2,
      action: "Account Rejected",
      user: "Admin",
      timestamp: "2023-10-02 11:30 AM",
      details:
        "Rejected account for Mark David G. Timpog (markdavid@gmail.com)",
    },
    {
      id: 3,
      action: "User Edited",
      user: "Admin",
      timestamp: "2023-10-03 02:15 PM",
      details: "Edited details for John Paul S. Vasquez (jpvasquez@gmail.com)",
    },
  ]);

  // State for filtering
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterUser, setFilterUser] = useState<string>("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const logsPerPage = 5;

  // Handle filter changes
  const handleFilterActionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterAction(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleFilterUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterUser(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Filter logs based on action and user
  const filteredLogs = auditLogs.filter(
    (log) =>
      (filterAction === "" || log.action === filterAction) &&
      (filterUser === "" ||
        log.user.toLowerCase().includes(filterUser.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={styles.auditTrail}>
      <h2>Audit Trail</h2>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Action:</label>
          <select value={filterAction} onChange={handleFilterActionChange}>
            <option value="">All Actions</option>
            <option value="Account Approved">Account Approved</option>
            <option value="Account Rejected">Account Rejected</option>
            <option value="User Edited">User Edited</option>
            <option value="User Deleted">User Deleted</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>User:</label>
          <input
            type="text"
            placeholder="Filter by user..."
            value={filterUser}
            onChange={handleFilterUserChange}
          />
        </div>
      </div>

      {/* Audit Log List */}
      <div className={styles.logList}>
        {currentLogs.length === 0 ? (
          <p>No logs found.</p>
        ) : (
          currentLogs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.logInfo}>
                <p>
                  <strong>Action:</strong> {log.action}
                </p>
                <p>
                  <strong>User:</strong> {log.user}
                </p>
                <p>
                  <strong>Timestamp:</strong> {log.timestamp}
                </p>
                <p>
                  <strong>Details:</strong> {log.details}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        {Array.from(
          { length: Math.ceil(filteredLogs.length / logsPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={currentPage === i + 1 ? styles.activePage : ""}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default AuditTrail;
