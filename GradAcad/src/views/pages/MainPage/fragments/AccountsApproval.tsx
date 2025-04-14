import { useContext, useEffect, useState } from "react";
import styles from "../styles/UserManagement.module.scss";
import {
  getAllApprovedUsers,
  handlePending,
} from "../../../../services/UserService";
import loadingHorizontal from "../../../../assets/webM/loadingHorizontal.webm";
import { UserContext } from "../../../../context/UserContext";
import API from "../../../../context/axiosInstance";

interface Account {
  _id: string;
  employeeId?: string;
  studentId?: string;
  refId?: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  approvedAt?: string;
}

const AccountApproval = () => {
  const [pendingAccounts, setPendingAccounts] = useState<Account[]>([]);
  const [approvedAccounts, setApprovedAccounts] = useState<Account[]>([]);
  const [showApproved, setShowApproved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  const context = useContext(UserContext);
  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;
  useEffect(() => {
    if (showApproved) {
      getAllApprovedUsers(
        selectedSort,
        selectedRole,
        currentPage,
        setApprovedAccounts,
        setCurrentPage,
        setTotalPages,
        setErrorMessage,
        setError,
        setLoading
      );
    } else {
      handlePending(
        selectedSort,
        selectedRole,
        currentPage,
        setPendingAccounts,
        setCurrentPage,
        setTotalPages,
        setErrorMessage,
        setError,
        setLoading
      );
    }
  }, [showApproved, selectedSort, selectedRole, currentPage]);

  const formatDate = (): string => {
    const now = new Date();
    const datePart = now.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const timePart = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} - ${timePart}`;
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await API.post("/user/approveAccount", { id });

      if (response.data.success) {
        // ✅ Remove from pending list
        setPendingAccounts((prev) =>
          prev.filter((account) => account._id !== id)
        );

        // ✅ Find the approved account
        const accountToApprove = pendingAccounts.find(
          (account) => account._id === id
        );
        if (accountToApprove) {
          // ✅ Add to approved list
          setApprovedAccounts((prev) => [
            ...prev,
            { ...accountToApprove, approvedAt: formatDate() },
          ]);

          // ✅ Log the approval action
          await API.post("/user/logs", {
            action: "Account Approved",
            userId: user?.refId, // ✅ Ensure refId is passed correctly
            name: user?.name,
            details: `Approved account for ${accountToApprove.name} (${accountToApprove.email})`,
            date: formatDate(), // ✅ Ensure the date is also logged
          });

          const responseEmail = await API.post("/email/sendApprovalEmail", {
            to: accountToApprove.email,
            username: accountToApprove.name,
          });

          if (responseEmail.data.success) {
            alert(
              "Account approved successfully! We will send her/him an email to inform."
            );
          } else {
            alert("Account approved successfully!");
          }
        }
      } else {
        alert("Failed to approve account: " + response.data.message);
      }
    } catch (error) {
      console.error("Error approving account:", error);
      alert("An error occurred while approving the account.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await API.post("/user/rejectAccount", { id });

      if (response.data.success) {
        // ✅ Remove from pending accounts
        setPendingAccounts((prev) =>
          prev.filter((account) => account._id !== id)
        );

        // ✅ Find rejected account details
        const accountToReject = pendingAccounts.find(
          (account) => account._id === id
        );
        if (accountToReject) {
          await API.post("/user/logs", {
            action: "Account Rejected",
            userId: user?.refId, // ✅ Log refId
            name: user?.name,
            details: `Rejected account for ${accountToReject.name} (${accountToReject.email})`,
            date: formatDate(), // ✅ Log the rejection date
          });

          const responseEmail = await API.post("/email/sendRejectionEmail", {
            to: accountToReject.email,
            username: accountToReject.name,
          });

          if (responseEmail.data.success) {
            alert(
              "Account rejected successfully! We will send her/him an email to inform."
            );
          } else {
            alert("Account rejected successfully!");
          }
        }
      } else {
        alert("Failed to reject account: " + response.data.message);
      }
    } catch (error) {
      console.error("Error rejecting account:", error);
      alert("An error occurred while rejecting the account.");
    }
  };

  const roleMapping: any = {
    prof: "Instructor",
    registrar: "Registrar",
    admin: "Admin",
    student: "Student",
    dean: "Dean",
  };

  return (
    <div className={styles.userManagement}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <h2>{showApproved ? "Approved Users" : "Account Approval"}</h2>
        <button
          style={{
            borderRadius: "10px",
            backgroundColor: showApproved ? "#0F2A71" : "green",
            height: "40px",
          }}
          onClick={() => setShowApproved(!showApproved)} // ✅ Toggle Archive View
        >
          {showApproved ? "Back to Pending Users" : "Approved List"}
        </button>
      </div>
      {/* Search Bar */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label style={{ color: "black" }}>Sort by Date:</label>
          <select
            style={{ width: "180px", height: "48px" }}
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label style={{ color: "black" }}>Filter by Role:</label>
          <select
            style={{ width: "180px", height: "48px" }}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All</option>
            <option value="admin">MIS</option>
            <option value="dean">Dean</option>
            <option value="registrar">Registrar</option>
            <option value="prof">Instructor</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label style={{ color: "black" }}>Find by Name:</label>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "87%", borderRadius: "4px" }}
          />
        </div>
      </div>

      {/* User Table */}
      <div className={styles.tableContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Role</th>
              {!showApproved ? (
                <>
                  <th>Registered Name</th>
                  <th>Registered Email</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </>
              ) : (
                <>
                  <th>Approved Name</th>
                  <th>Approved Email</th>
                  <th>Approved Date</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {error ? (
              <h3 style={{ paddingLeft: "20px" }}>{errorMessage}</h3>
            ) : loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  <video
                    autoPlay
                    loop
                    muted
                    className={styles.loadingAnimation}
                    width={60}
                  >
                    <source src={loadingHorizontal} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </td>
              </tr>
            ) : (
              (() => {
                const accounts = showApproved
                  ? approvedAccounts
                  : pendingAccounts;
                const filteredAccounts = accounts.filter(
                  (user) =>
                    user.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredAccounts.length === 0) {
                  return (
                    <h3 style={{ paddingLeft: "20px" }}>
                      No {showApproved ? "approved" : "pending"} account/s
                      found.
                    </h3>
                  );
                }

                return filteredAccounts.map((user) => (
                  <tr key={user._id}>
                    <td>{user.refId || user.studentId}</td>
                    <td>{roleMapping[user.role] || user.role}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    {!showApproved ? (
                      <>
                        <td>{user.createdAt}</td>
                        <td className={styles.actions}>
                          <button
                            className={styles.approveButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(user._id);
                            }}
                          >
                            Approve
                          </button>
                          <button
                            className={styles.rejectButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(user._id);
                            }}
                          >
                            Reject
                          </button>
                        </td>
                      </>
                    ) : (
                      <td>{user.approvedAt}</td>
                    )}
                  </tr>
                ));
              })()
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>

        {(() => {
          const pages = [];
          const maxVisiblePages = 3;
          const sidePages = 1;

          const shouldShowLeftEllipsis =
            currentPage > sidePages + maxVisiblePages;
          const shouldShowRightEllipsis =
            currentPage < totalPages - sidePages - maxVisiblePages + 1;

          pages.push(
            <button
              key={1}
              onClick={() => setCurrentPage(1)}
              className={currentPage === 1 ? styles.activePage : ""}
            >
              1
            </button>
          );

          if (shouldShowLeftEllipsis)
            pages.push(<span key="left-ellipsis">...</span>);

          const start = Math.max(2, currentPage - sidePages);
          const end = Math.min(totalPages - 1, currentPage + sidePages);

          for (let i = start; i <= end; i++) {
            pages.push(
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={currentPage === i ? styles.activePage : ""}
              >
                {i}
              </button>
            );
          }

          if (shouldShowRightEllipsis)
            pages.push(<span key="right-ellipsis">...</span>);

          if (totalPages > 1) {
            pages.push(
              <button
                key={totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className={currentPage === totalPages ? styles.activePage : ""}
              >
                {totalPages}
              </button>
            );
          }

          return pages;
        })()}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AccountApproval;
