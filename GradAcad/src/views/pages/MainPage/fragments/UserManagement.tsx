import { useContext, useEffect, useState } from "react";
import styles from "../styles/UserManagement.module.scss";
import { UserContext } from "../../../../context/UserContext";
import loadingAnimation from "../../../../assets/webM/loading.webm";
import loadingHorizontal from "../../../../assets/webM/loadingHorizontal.webm";
import API from "../../../../context/axiosInstance";

interface User {
  refId: string;
  name: string;
  email: string;
  status: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [archivedUsers, setArchivedUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [originalRefId, setOriginalRefId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<
    Record<string, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("Active");

  const context = useContext(UserContext);
  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");
    setError(false);
    setArchivedUsers([]);
    setUsers([]);
    if (showArchived) {
      const getArchivedUsers = async () => {
        try {
          const response = await API.post("/user/getArchivedUsers", {
            role: selectedRole,
            status: selectedStatus,
            page: currentPage,
          });

          if (response.data.success) {
            setArchivedUsers(response.data.users);
          } else {
            setErrorMessage(
              response.data.message || "No archived users found."
            );
          }
        } catch (error) {
          setError(true);
          setErrorMessage(
            (error as any).response?.data?.message || "An error occurred."
          );
        } finally {
          setLoading(false);
        }
      };

      getArchivedUsers();
    } else {
      const fetchUsers = async () => {
        try {
          const response = await API.post("/user/getManageUsers", {
            role: selectedRole,
            status: selectedStatus,
            page: currentPage,
          });

          if (response.data.success) {
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
          } else {
            setUsers([]);
            setErrorMessage(response.data.message || "No users found.");
          }
        } catch (error) {
          setError(true);
          setErrorMessage(
            (error as any).response?.data?.message || "An error occurred."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [selectedRole, selectedStatus, currentPage, showArchived]);

  const handleArchive = async (refId: string) => {
    if (!window.confirm("Are you sure you want to archive this user?")) {
      return;
    }

    // ✅ Find user before archive for logs
    const userToArchive = users.find((user) => user.refId === refId);
    if (!userToArchive) {
      alert("User not found.");
      return;
    }

    try {
      const response = await API.post("/user/archiveUser", {
        refId,
      });

      if (response.data.success) {
        alert("User archive successfully!");

        // ✅ Log Deletion
        await API.post("/user/logs", {
          action: "User Archived",
          userId: user?.refId,
          name: user?.name,
          details: `Archived user: ${userToArchive.name} (${userToArchive.email})`,
          date: new Date().toLocaleString(),
        });

        // ✅ Remove from UI
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.refId !== refId)
        );
      } else {
        alert(response.data.message || "Failed to archive user.");
      }
    } catch (error) {
      console.error("Error archive user:", error);
      alert("An error occurred while archiving the user.");
    }
  };

  const handleRestore = async (refId: string) => {
    if (!window.confirm("Are you sure you want to restore this user?")) {
      return;
    }

    // ✅ Find user before restore for logs
    const userToRestore = archivedUsers.find((user) => user.refId === refId);
    if (!userToRestore) {
      alert("User not found in archive.");
      return;
    }

    try {
      const response = await API.post("/user/restoreUser", {
        refId,
      });

      if (response.data.success) {
        alert("User restored successfully!");

        // ✅ Log Restoration
        await API.post("/user/logs", {
          action: "User Restored",
          userId: user?.refId,
          name: user?.name,
          details: `Restored user: ${userToRestore.name} (${userToRestore.email})`,
          date: new Date().toLocaleString(),
        });

        // ✅ Remove from UI (Archived List)
        setArchivedUsers((prevUsers) =>
          prevUsers.filter((user) => user.refId !== refId)
        );
      } else {
        alert(response.data.message || "Failed to restore user.");
      }
    } catch (error) {
      console.error("Error restoring user:", error);
      alert("An error occurred while restoring the user.");
    }
  };

  const handleStatusChange = async (
    refId: string,
    newStatus: string,
    setIsUpdating: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  ) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [refId]: true }));

      const response = await API.put("/user/updateUserStatus", {
        refId,
        status: newStatus,
      });

      if (response.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.refId === refId ? { ...user, status: newStatus } : user
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status.");
    } finally {
      setTimeout(() => {
        setIsUpdating((prev) => ({ ...prev, [refId]: false }));
      }, 1000);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOriginalRefId(user.refId);
  };

  const handleSave = async (editedUser: User) => {
    if (!editedUser || !originalRefId) return;

    const originalUser = users.find((user) => user.refId === originalRefId);
    if (!originalUser) {
      console.error("User not found in the current list.");
      return;
    }

    // ✅ Check if any changes were made
    const hasChanges =
      originalUser.name !== editedUser.name ||
      originalUser.email !== editedUser.email ||
      originalUser.refId !== editedUser.refId;

    if (!hasChanges) {
      alert("No changes detected.");
      setEditingUser(null);
      return;
    }

    try {
      const response = await API.put("/user/updateByRefId", {
        originalRefId, // Send original refId
        newRefId: editedUser.refId, // Send updated refId
        name: editedUser.name,
        email: editedUser.email,
      });

      if (response.data.success) {
        alert("User updated successfully!");

        // ✅ Log Changes
        const changes = [];
        if (originalUser.name !== editedUser.name)
          changes.push(`Name: ${originalUser.name} --> ${editedUser.name}`);
        if (originalUser.email !== editedUser.email)
          changes.push(`Email: ${originalUser.email} --> ${editedUser.email}`);
        if (originalUser.refId !== editedUser.refId)
          changes.push(
            `Ref ID: ${originalUser.refId} change to ${editedUser.refId}`
          );

        await API.post("/user/logs", {
          action: "User Edited",
          userId: user?.refId, // ✅ New Ref ID after update
          name: user?.name,
          details: changes.join(" | "), // ✅ Logs all changes in one string
          date: new Date().toLocaleString(), // ✅ Current timestamp
        });

        // ✅ Update the UI
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.refId === originalRefId ? { ...user, ...editedUser } : user
          )
        );

        setEditingUser(null);
        setOriginalRefId(null);
      } else {
        alert(response.data.message || "Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("An error occurred while updating the user.");
    }
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
        <h2>{showArchived ? "Archived Users" : "User Management"}</h2>
        <button
          style={{
            borderRadius: "10px",
            backgroundColor: showArchived ? "#0F2A71" : "green",
            height: "40px",
          }}
          onClick={() => setShowArchived(!showArchived)} // ✅ Toggle Archive View
        >
          {showArchived ? "Back to Active Users" : "Archive List"}
        </button>
      </div>

      {/* Search Bar */}
      <div className={styles.filters}>
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
          <label style={{ color: "black" }}>Status:</label>
          <select
            style={{ width: "180px", height: "48px" }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <h3 style={{ paddingLeft: "20px" }}>{errorMessage}</h3>
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
            ) : (
              (showArchived ? archivedUsers : users)
                .filter(
                  (user) =>
                    user.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((user) => (
                  <tr key={user.refId}>
                    <td>{user.refId}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <select
                        value={user.status}
                        onChange={(e) =>
                          handleStatusChange(
                            user.refId,
                            e.target.value,
                            setIsUpdatingStatus
                          )
                        }
                        disabled={isUpdatingStatus[user.refId] || showArchived}
                        style={{ width: "100px", padding: "11px" }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      {isUpdatingStatus[user.refId] && (
                        <video
                          autoPlay
                          loop
                          muted
                          className={styles.loadingAnimation}
                          width={60}
                        >
                          <source src={loadingAnimation} type="video/webm" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </td>
                    <td>
                      {showArchived ? (
                        <button
                          className={styles.archiveButton}
                          onClick={() => handleRestore(user.refId)}
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            className={styles.editButton}
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.archiveButton}
                            onClick={() => handleArchive(user.refId)}
                          >
                            Archive
                          </button>
                        </>
                      )}
                    </td>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit User</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(editingUser);
              }}
            >
              <div className={styles.formGroup}>
                <p style={{ fontSize: "16px" }}>
                  ID : <strong>{editingUser.refId}</strong>
                </p>
              </div>
              <div className={styles.formGroup}>
                <p style={{ fontSize: "16px" }}>
                  Email : <strong>{editingUser.email}</strong>
                </p>
              </div>
              <div className={styles.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>
              <div className={styles.modalActions}>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
