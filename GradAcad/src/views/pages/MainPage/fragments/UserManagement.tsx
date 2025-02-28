import { useState } from "react";
import styles from "../styles/UserManagement.module.scss"; // Import CSS module

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const UserManagement = () => {
  // State for all users
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juandelacruz@gmail.com",
      role: "User",
    },
    {
      id: 2,
      name: "Pedro San Pedro",
      email: "sanpedro@gmail.com",
      role: "Admin",
    },
    {
      id: 3,
      name: "Berto Correa",
      email: "correa_berto@gmail.com",
      role: "User",
    },
  ]);

  // State for editing a user
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // State for search query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Handle deleting a user
  const handleDelete = (id: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  // Handle editing a user
  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  // Handle saving edited user details
  const handleSave = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setEditingUser(null); // Close the edit form
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter users based on search query
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
          onChange={handleSearchChange}
        />
      </div>

      {/* User List */}
      <div className={styles.userList}>
        {filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className={styles.userItem}>
              <div className={styles.userInfo}>
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit User Form */}
      {editingUser && (
        <div className={styles.editForm}>
          <h3>Edit User</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editingUser);
            }}
          >
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
            <div className={styles.formGroup}>
              <label>Role:</label>
              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value })
                }
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
