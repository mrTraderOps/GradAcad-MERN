import { useState } from "react";
import styles from "../styles/AccountApproval.module.scss";
import searchIcon from "../../../../assets/images/search_Icon.png";
import arrow from "../../../../assets/icons/arrow.png";
import closeIcon from "../../../../assets/icons/x-button.png";

interface Account {
  id: number;
  name: string;
  email: string;
  role: string;
  approvedAt?: string;
}
// Modal Component

const AccountApproval = () => {
  // Example data for pending accounts (replace with data from your backend)
  const [pendingAccounts, setPendingAccounts] = useState<Account[]>([
    {
      id: 20200219,
      name: "Verzon, Earl Gierald B.",
      email: "earlbandiola@gmail.com",
      role: "Student", // Add role field
    },
    {
      id: 20200218,
      name: "Torres, Christian O.",
      email: "christiantorres@gmail.com",
      role: "Instructor", // Add role field
    },
    {
      id: 20200217,
      name: "Nicolas, Jeanita",
      email: "jeanitanicolas@gmail.com",
      role: "Registrar", // Add role field
    },
  ]);

  // State for approved accounts
  const [approvedAccounts, setApprovedAccounts] = useState<Account[]>([]);

  const [currentPanel, setCurrentPanel] = useState("pending");

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const formatDate = (): string => {
    const now = new Date();

    // Format the date as MM/DD/YYYY
    const datePart = now.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    // Format the time as HH:mm AM/PM
    const timePart = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Ensures 12-hour format
    });

    return `${datePart} - ${timePart}`;
  };

  const handleApprove = (id: number) => {
    const accountToApprove = pendingAccounts.find(
      (account) => account.id === id
    );

    if (accountToApprove) {
      // Move account from pending to approved with a timestamp
      setPendingAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );

      setApprovedAccounts((prevAccounts) => [
        ...prevAccounts,
        { ...accountToApprove, approvedAt: formatDate() }, // Add timestamp
      ]);
    }
  };

  // Handle account rejection
  const handleReject = (id: any) => {
    setPendingAccounts((prevAccounts) =>
      prevAccounts.filter((account) => account.id !== id)
    );
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleAccountClick = (account: any) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
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
            pendingAccounts.map((account) => (
              <div
                key={account.id}
                className={styles.accountItem}
                // onClick={() => handleAccountClick(account)}
              >
                <div className={styles.accountInfo}>
                  <p>
                    <strong>Role: </strong>
                    {account.role}
                  </p>
                  <span className={styles.divider}>|</span>
                  {account.role === "Student" && (
                    <>
                      <p>
                        <strong>Student ID: </strong>
                        {account.id}
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
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.approveButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(account.id);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(account.id);
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )
        ) : approvedAccounts.length === 0 ? (
          <p>No approved accounts.</p>
        ) : (
          approvedAccounts.map((account) => (
            <div key={account.id} className={styles.accountItem}>
              <div className={styles.accountInfo}>
                <p>
                  <strong>Role: </strong>
                  {account.role}
                </p>
                <span className={styles.divider}>|</span>
                {account.role === "Student" && (
                  <>
                    <p>
                      <strong>Student ID: </strong>
                      {account.id}
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
      {/* Modal */}
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
