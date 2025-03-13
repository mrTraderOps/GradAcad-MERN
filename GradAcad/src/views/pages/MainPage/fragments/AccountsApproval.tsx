import { useEffect, useState } from "react";
import styles from "../styles/AccountApproval.module.scss";
import searchIcon from "../../../../assets/images/search_Icon.png";
import arrow from "../../../../assets/icons/arrow.png";
import closeIcon from "../../../../assets/icons/x-button.png";
import { handlePending } from "../../../../services/UserService";
import axios from "axios";

interface Account {
  _id: string;
  studentId?: string;
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

  useEffect(() => {
    handlePending(setPendingAccounts, setErrorMessage);
  }, []);

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
    // Ensure id is string
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/user/approveAccount",
        {
          id: id.toString(), // Send id as string
        }
      );

      if (response.data.success) {
        setPendingAccounts((prevAccounts) =>
          prevAccounts.filter((account) => account._id !== id)
        );

        const accountToApprove = pendingAccounts.find(
          (account) => account._id === id
        );
        if (accountToApprove) {
          setApprovedAccounts((prevAccounts) => [
            ...prevAccounts,
            { ...accountToApprove, approvedAt: formatDate() },
          ]);
        }

        alert("Account approved successfully!");
      } else {
        alert("Failed to approve account: " + response.data.message);
      }
    } catch (error) {
      console.error("Error approving account:", error);
      alert("An error occurred while approving the account.");
    }
  };

  const handleReject = (id: any) => {
    setPendingAccounts((prevAccounts) =>
      prevAccounts.filter((account) => account._id !== id)
    );
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleAccountClick = (account: any) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

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
          <input type="text" placeholder="Search accounts..." />
        </div>
        <div className={styles.buttonGroup}>
          <img src={arrow} alt="filter" width={25} height={25} />
          <select>
            <option value="">Filter by Role</option>
            <option value="Option 1">Admin</option>
            <option value="Option 2">Instructor</option>
            <option value="Option 3">Student</option>
            <option value="Option 3">Registrar</option>
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
          <button className={styles.printButton}>Print</button>
        </div>
      </div>
      <div className={styles.accountList}>
        {currentPanel === "pending" ? (
          pendingAccounts.length === 0 ? (
            <p>No pending accounts.</p>
          ) : (
            pendingAccounts.map((account) => {
              const displayRole = roleMapping[account.role] || account.role; // Transform the role
              return (
                <div
                  key={account._id}
                  className={styles.accountItem}
                  // onClick={() => handleAccountClick(account)}
                >
                  <div className={styles.accountInfo}>
                    <p>
                      <strong>Role: </strong>
                      {displayRole} {/* Use the transformed role here */}
                    </p>
                    <span className={styles.divider}>|</span>
                    {account.role === "student" && (
                      <>
                        <p>
                          <strong>Student ID: </strong>
                          {account.studentId}
                        </p>
                        <span className={styles.divider}>|</span>
                      </>
                    )}
                    <p>
                      <strong>Registered Name: </strong>
                      {account.name}
                    </p>
                    <span className={styles.divider}>|</span>
                    <p>
                      <strong>Registered E-mail Address: </strong>
                      {account.email}
                    </p>
                    <p>
                      <strong>Created At: </strong>
                      {account.createdAt}
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
        ) : approvedAccounts.length === 0 ? (
          <p>No approved accounts.</p>
        ) : (
          approvedAccounts.map((account) => (
            <div key={account._id} className={styles.accountItem}>
              <div className={styles.accountInfo}>
                <p>
                  <strong>Role: </strong>
                  {roleMapping[account.role] || account.role}{" "}
                  {/* Transform the role here as well */}
                </p>
                <span className={styles.divider}>|</span>
                {account.role === "student" && (
                  <>
                    <p>
                      <strong>Student ID: </strong>
                      {account.studentId}
                    </p>
                    <span className={styles.divider}>|</span>
                  </>
                )}
                <p>
                  <strong>Registered Name: </strong>
                  {account.name}
                </p>
                <span className={styles.divider}>|</span>
                <p>
                  <strong>Registered E-mail Address: </strong>
                  {account.email}
                </p>
                <span className={styles.divider}>|</span>
                <p>
                  <strong>Approved At: </strong>
                  {account.approvedAt}
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
