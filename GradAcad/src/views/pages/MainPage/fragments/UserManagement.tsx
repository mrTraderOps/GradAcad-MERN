import { useContext, useEffect, useState } from "react";
import styles from "../styles/UserManagement.module.scss";
import axios from "axios";
import { UserContext } from "../../../../context/UserContext";

interface User {
  refId: string;
  name: string;
  email: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [originalRefId, setOriginalRefId] = useState<string | null>(null);
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("ExportExcel must be used within a UserProvider");
  }

  const { user } = context;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/v1/user/getManageUsers") // ✅ Call backend API
      .then((response) => {
        if (response.data.success) {
          setUsers(response.data.users); // ✅ Store user data
        } else {
          setErrorMessage(response.data.message || "No users found.");
        }
      })
      .catch((error) => {
        const message = error.response?.data?.message || "An error occurred.";
        setErrorMessage(message);
      });
  }, []);

  // Handle delete user
  const handleDelete = async (refId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    // ✅ Find user before deleting for logs
    const userToDelete = users.find((user) => user.refId === refId);
    if (!userToDelete) {
      alert("User not found.");
      return;
    }

    try {
      const response = await axios.delete(
        "http://localhost:5000/api/v1/user/deleteByRefId",
        {
          data: { refId },
        }
      );

      if (response.data.success) {
        alert("User deleted successfully!");

        // ✅ Log Deletion
        await axios.post("http://localhost:5000/api/v1/user/logs", {
          action: "User Deleted",
          userId: user?.refId,
          name: user?.name,
          details: `Deleted user: ${userToDelete.name} (${userToDelete.email})`,
          date: new Date().toLocaleString(), // ✅ Capture current timestamp
        });

        // ✅ Remove from UI
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.refId !== refId)
        );
      } else {
        alert(response.data.message || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user.");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setOriginalRefId(user.refId); // Store original refId before changes
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
      const response = await axios.put(
        "http://localhost:5000/api/v1/user/updateByRefId",
        {
          originalRefId, // Send original refId
          newRefId: editedUser.refId, // Send updated refId
          name: editedUser.name,
          email: editedUser.email,
        }
      );

      if (response.data.success) {
        alert("User updated successfully!");

        // ✅ Log Changes
        const changes = [];
        if (originalUser.name !== editedUser.name)
          changes.push(`Name: ${originalUser.name} → ${editedUser.name}`);
        if (originalUser.email !== editedUser.email)
          changes.push(`Email: ${originalUser.email} → ${editedUser.email}`);
        if (originalUser.refId !== editedUser.refId)
          changes.push(`Ref ID: ${originalUser.refId} → ${editedUser.refId}`);

        await axios.post("http://localhost:5000/api/v1/user/logs", {
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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.userManagement}>
      <h2>User Management</h2>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* User Table */}
      <div className={styles.tableContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.noUsers}>
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.refId}>
                  <td>{user.refId}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(user.refId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                <label>ID:</label>
                <input
                  type="text"
                  value={editingUser.refId}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, refId: e.target.value })
                  }
                  readOnly={true}
                />
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
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
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
