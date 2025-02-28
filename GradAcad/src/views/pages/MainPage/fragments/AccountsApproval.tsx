import { useState } from "react";
import styles from "../styles/AccountApproval.module.scss";

const AccountApproval = () => {
  // Example data for pending accounts (replace with data from your backend)
  const [pendingAccounts, setPendingAccounts] = useState([
    { id: 1, name: "Juan Dela Cruz", email: "juandelacruz@gmail.com" },
    { id: 2, name: "Pedro Santos", email: "santospedro@gmail.com" },
  ]);

  // Handle account approval
  const handleApprove = (id: number) => {
    setPendingAccounts((prevAccounts) =>
      prevAccounts.filter((account) => account.id !== id)
    );
    // Add logic to update the backend (e.g., mark account as approved)
  };

  // Handle account rejection
  const handleReject = (id: number) => {
    setPendingAccounts((prevAccounts) =>
      prevAccounts.filter((account) => account.id !== id)
    );
    // Add logic to update the backend (e.g., mark account as rejected)
  };

  return (
    <div className={styles.accountApproval}>
      <h5>Pending Accounts</h5>
      <div className={styles.searchBar}>
        <input type="text" placeholder="Search accounts..." />
      </div>
      <div className={styles.buttonGroup}>
        <button className={styles.pendingButton}>Pending</button>
        <button className={styles.approvedButton}>Approved</button>
      </div>
      <div className={styles.accountList}>
        {pendingAccounts.length === 0 ? (
          <p>No pending accounts.</p>
        ) : (
          pendingAccounts.map((account) => (
            <div key={account.id} className={styles.accountItem}>
              <div className={styles.accountInfo}>
                <p>{account.name}</p>
                <p>{account.email}</p>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.approveButton}
                  onClick={() => handleApprove(account.id)}
                >
                  Approve
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={() => handleReject(account.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AccountApproval;
