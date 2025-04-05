import { useContext, useEffect, useState } from "react";
import styles from "../styles/AccountApproval.module.scss";
import searchIcon from "../../../../assets/images/search_Icon.png";
import arrow from "../../../../assets/icons/arrow.png";
import closeIcon from "../../../../assets/icons/x-button.png";
import { getAllUsers, handlePending } from "../../../../services/UserService";
import { UserContext } from "../../../../context/UserContext";
import { API } from "../../../../context/axiosInstance";

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
  const [error, setErrorMessage] = useState("");
  const [approvedAccounts, setApprovedAccounts] = useState<Account[]>([]);
  const [currentPanel, setCurrentPanel] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;

  useEffect(() => {
    handlePending(setPendingAccounts, setErrorMessage);
    getAllUsers(setApprovedAccounts, setErrorMessage);
  }, [currentPanel]);

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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  // Filter function for accounts based on search and role
  const filteredPendingAccounts = pendingAccounts.filter((account) => {
    const matchesRole = roleFilter
      ? account.role.toLowerCase() === roleFilter.toLowerCase()
      : true;
    const matchesSearch =
      account.name.includes(searchTerm) || account.email.includes(searchTerm);

    return matchesRole && matchesSearch;
  });

  const filteredApprovedAccounts = approvedAccounts.filter((account) => {
    const matchesRole = roleFilter
      ? account.role.toLowerCase() === roleFilter.toLowerCase()
      : true;
    const matchesSearch =
      account.name.includes(searchTerm) || account.email.includes(searchTerm);

    return matchesRole && matchesSearch;
  });
  // Role mapping object
  const roleMapping: any = {
    prof: "Instructor",
    registrar: "Registrar",
    admin: "Admin",
    student: "Student",
  };

  return (
    <div className={styles.accountApproval}>
      <h5>
        {currentPanel === "pending" ? "Pending Accounts" : "Approved Accounts"}
      </h5>
      <div className={styles.container1}>
        <div className={styles.searchBar}>
          <img src={searchIcon} alt="search" width={20} height={20} />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update state on input change
          />
        </div>
        <div className={styles.buttonGroup}>
          <img src={arrow} alt="filter" width={25} height={25} />
          <select
            onChange={(e) => setRoleFilter(e.target.value)}
            value={roleFilter}
          >
            <option value="">Filter by Role</option>
            <option value="admin">Admin</option>
            <option value="prof">Instructor</option>
            <option value="student">Student</option>
            <option value="registrar">Registrar</option>
          </select>
          <button
            className={styles.pendingButton}
            onClick={() => setCurrentPanel("pending")}
          >
            Pending
          </button>
          <button
            className={styles.approvedButton}
            onClick={() => setCurrentPanel("approved")}
          >
            Approved
          </button>
          {/* <button className={styles.printButton}>Print</button> */}
        </div>
      </div>
      <div className={styles.accountList}>
        {error ? (
          <h2>Internal Server Error</h2>
        ) : currentPanel === "pending" ? (
          filteredPendingAccounts.length === 0 ? (
            <p>No pending accounts.</p>
          ) : (
            filteredPendingAccounts.map((account) => {
              return (
                <div
                  key={account._id}
                  className={styles.accountItem}
                  // onClick={() => handleAccountClick(account)}
                >
                  <div className={styles.accountInfo}>
                    <p>
                      <p style={{ fontWeight: "normal" }}>Role: </p>
                      <strong>{account.role}</strong>
                    </p>
                    {account.role === "student" && (
                      <>
                        <p>
                          <p style={{ fontWeight: "normal" }}>Student ID:</p>
                          <strong>{account.studentId}</strong>
                        </p>
                      </>
                    )}
                    <p>
                      <p style={{ fontWeight: "normal" }}>Registered Name: </p>
                      <strong>{account.name}</strong>
                    </p>
                    <p>
                      <p style={{ fontWeight: "normal" }}>
                        Registered E-mail Address:{" "}
                      </p>
                      <strong>{account.email}</strong>
                    </p>
                    <p>
                      <p style={{ fontWeight: "normal" }}>Created At:</p>
                      <strong>{account.createdAt}</strong>
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.approveButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(account._id);
                      }}
                    >
                      Approve
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(account._id);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : filteredApprovedAccounts.length === 0 ? (
          <p>No approved accounts.</p>
        ) : (
          filteredApprovedAccounts.map((account) => (
            <div key={account._id} className={styles.accountItem}>
              <div className={styles.accountInfo}>
                <p>
                  <p style={{ fontWeight: "normal" }}>Role:</p>
                  <strong>{roleMapping[account.role] || account.role}</strong>
                </p>
                {account.role === "student" && (
                  <>
                    <p>
                      <p style={{ fontWeight: "normal" }}>Student ID:</p>
                      <strong>{account.studentId}</strong>
                    </p>
                  </>
                )}
                <p>
                  <p style={{ fontWeight: "normal" }}>Registered Name:</p>
                  <strong>{account.name} </strong>
                </p>

                <p>
                  <p style={{ fontWeight: "normal" }}>
                    Registered E-mail Address:{" "}
                  </p>
                  <strong>{account.email}</strong>
                </p>
                <p>
                  <p style={{ fontWeight: "normal" }}>Approved At:</p>
                  <strong> {account.approvedAt}</strong>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      {isModalOpen && (
        <AccountModal account={selectedAccount} onClose={closeModal} />
      )}
    </div>
  );
};

const AccountModal = ({ account, onClose }: any) => {
  if (!account) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          <img src={closeIcon} alt="close" width={20} height={20} />
        </button>
        <h3>Account Details</h3>
        <p>
          <strong>Name:</strong> {account.name}
        </p>
        <p>
          <strong>Email:</strong> {account.email}
        </p>
      </div>
    </div>
  );
};

export default AccountApproval;
