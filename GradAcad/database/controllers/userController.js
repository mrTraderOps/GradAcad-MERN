import { getDB } from '../config/db.js';
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import axios from "axios";

export const getPendingUsers = async (req, res) => {
  const { sorter = "newest", role = "", page = 1 } = req.body;

  try {
    const db = getDB();
    const collection = db.collection("pending");

    const pageSize = 20;
    const skip = (parseInt(page) - 1) * pageSize;

    // Build filter object
    const filter = {};
    if (role !== "") {
      filter.role = role;
    }

    // Determine sorting direction
    const sort = {
      createdAt: sorter === "oldest" ? 1 : -1,
    };

    // Get total count
    const total = await collection.countDocuments(filter);

    // Fetch paginated + sorted + filtered users (exclude password)
    const pending = await collection
      .find(filter, { projection: { password: 0 } })
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .toArray();

    res.status(200).json({
      success: true,
      pending,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllApprovedUsers = async (req, res) => {
  const { sorter = "newest", role = "", page = 1 } = req.body;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Match stage (optional filtering)
    const matchStage = {};
    if (role) {
      matchStage.role = role;
    }

    // Sort direction
    const sortDirection = sorter === "oldest" ? 1 : -1;

    // Count total for pagination
    const totalUsers = await usersCollection.countDocuments(matchStage);
    const totalPages = Math.ceil(totalUsers / pageSize);

    const users = await usersCollection
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "approved",
            localField: "refId",
            foreignField: "employeeId",
            as: "approvalData",
          },
        },
        {
          $project: {
            password: 0,
            "approvalData._id": 0,
          },
        },
        {
          $addFields: {
            approvedAt: { $arrayElemAt: ["$approvalData.approvedAt", 0] },
          },
        },
        {
          $project: {
            approvalData: 0,
          },
        },
        { $sort: { approvedAt: sortDirection } },
        { $skip: skip },
        { $limit: pageSize },
      ])
      .toArray();

    if (users.length > 0) {
      res.status(200).json({
        success: true,
        users,
        currentPage: Number(page),
        totalPages,
      });
    } else {
      res.status(404).json({ success: false, message: "No users found" });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllUsersForGradeRequest = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Fetch only users with role "prof" and status "active"
    const users = await usersCollection
      .find({ role: "prof", status: "Active" }, { projection: { refId: 1, name: 1, _id: 0 } })
      .toArray();

    if (users.length > 0) {
      res.status(200).json({ success: true, users });
    } else {
      res.status(404).json({ success: false, message: "No active professors found." });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getManageUsers = async (req, res) => {
  const { role, status, page = 1 } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    const query = {};

    // Dynamically apply filters if provided
    if (role && role.trim() !== "") {
      query.role = role;
    }

    if (status && status.trim() !== "") {
      query.status = status;
    }

    const pageNumber = parseInt(page);
    const pageSize = 20;
    const skip = (pageNumber - 1) * pageSize;

    // Count total matching users (for pagination metadata)
    const totalUsers = await usersCollection.countDocuments(query);

    // Fetch users with pagination
    const users = await usersCollection
      .find(query, { projection: { password: 0 } }) // Exclude password only
      .skip(skip)
      .limit(pageSize)
      .toArray();

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / pageSize),
        totalUsers,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const approveAccount = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: "Account ID is required" });
  }

  try {
    const db = getDB();
    const pendingCollection = db.collection("pending");
    const usersCollection = db.collection("users");
    const approvedCollection = db.collection("approved");

    // Find the pending account
    const accountToApprove = await pendingCollection.findOne({ _id: new ObjectId(id) });

    if (!accountToApprove) {
      return res.status(404).json({ success: false, message: "Account not found in pending collection" });
    }

    // Convert studentId / employeeId to refId
    const refId = accountToApprove.studentId || accountToApprove.employeeId;

    // Step 1: Insert into users collection (excluding createdAt)
    const { createdAt, ...userData } = accountToApprove;
    await usersCollection.insertOne({ ...userData, refId });

    // Step 2: Insert into approved collection (including createdAt & approvedAt)
    const approvedAt = new Date().toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
    await approvedCollection.insertOne({ employeeId: refId, createdAt, approvedAt });

    // Step 3: Remove from pending collection
    await pendingCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ success: true, message: "Account approved successfully" });
  } catch (error) {
    console.error("Error approving account:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const rejectAccount = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: "Account ID is required" });
  }

  try {
    const db = getDB();
    const pendingCollection = db.collection("pending");
    const rejectedCollection = db.collection("rejected");

    // Find the pending account
    const accountToReject = await pendingCollection.findOne({ _id: new ObjectId(id) });

    if (!accountToReject) {
      return res.status(404).json({ success: false, message: "Account not found in pending collection" });
    }

    // Step 1: Insert into rejected collection (adding rejectedAt)
    const rejectedAt = new Date().toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
    await rejectedCollection.insertOne({ ...accountToReject, rejectedAt });

    // Step 2: Remove from pending collection
    await pendingCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ success: true, message: "Account rejected successfully" });
  } catch (error) {
    console.error("Error rejecting account:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const { originalRefId, newRefId, name, email } = req.body;

  if (!originalRefId || !newRefId || !name || !email) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    const db = getDB();
    
    // ✅ Use updateOne instead of findOneAndUpdate
    const updatedUser = await db.collection("users").findOneAndUpdate(
      { refId: String(originalRefId) }, // 🔥 Ensure string type
      { $set: { refId: String(newRefId), name, email } },
      { returnDocument: "after" } // ✅ Ensures the updated document is returned
    );

    if (updateUser.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (updateUser.modifiedCount === 0) {
      return res.status(200).json({ success: true, message: "No changes made to the user." });
    }

    res.json({ success: true, message: "User updated successfully!", user: updatedUser });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { refId, currentPassword, newPassword } = req.body;

    if (!refId || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const db = getDB();
    const usersCollection = db.collection("users");

    // Find user by refId
    const user = await usersCollection.findOne({ refId });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Compare current password with stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect current password." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    await usersCollection.updateOne(
      { refId },
      { $set: { password: hashedPassword } }
    );

    // Log the password change
    await axios.post("http://localhost:5000/api/v1/user/logs", {
      action: "Password Changed",
      userId: refId,
      name: user.name,
      date: new Date().toLocaleString(),
      details: `${user.name} Updated Password.`,
    });

    res.status(200).json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { refId } = req.body; // Get refId from request body

    if (!refId) {
      return res.status(400).json({ success: false, message: "Missing user ID." });
    }

    const db = getDB();
    const usersCollection = db.collection("users");
    const approveCollection = db.collection("approved")

    // Delete the user
    const result = await usersCollection.deleteOne({ refId });
    const result2 =await approveCollection.deleteOne({ employeeId: refId });

    if (result.deletedCount > 0 && result2.deletedCount > 0) {
      res.status(200).json({ success: true, message: "User deleted successfully." });
    } else {
      res.status(404).json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

export const auditUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, action, userId, startDate, endDate } = req.body;

    const db = getDB();
    const logsCollection = db.collection("logs");

    const query = {};
    if (action?.trim()) query.action = action.trim();
    if (userId?.trim()) query.userId = { $regex: userId.trim(), $options: 'i' };

    // 🔥 Fix Date Filtering: Convert stored date string to ISO format
    if (startDate || endDate) {
      query.$expr = {
        $and: []
      };

      if (startDate) {
        query.$expr.$and.push({
          $gte: [{ $dateFromString: { dateString: "$date", format: "%d %b %Y" } }, new Date(startDate)]
        });
      }

      if (endDate) {
        query.$expr.$and.push({
          $lte: [{ $dateFromString: { dateString: "$date", format: "%d %b %Y" } }, new Date(endDate)]
        });
      }
    }

    const logs = await logsCollection
    .aggregate([
      {
        $addFields: {
          dateObj: {
            $dateFromString: {
              dateString: "$date", // assuming stored like "11 Apr 2025"
              format: "%d %b %Y",
            },
          },
        },
      },
      { $sort: { dateObj: -1 } }, // Sort using real date
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ])
    .toArray();

    // Get total count
    const totalCount = await logsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    if (logs.length > 0) {
      res.status(200).json({ success: true, logs, totalPages });
    } else {
      res.status(404).json({ success: false, message: "No logs found" });
    }
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const pendingApprovedUsers = async (req, res) => {
  try {
    const db = getDB();
    const pendingCollection = db.collection("pending");
    const approvedCollection = db.collection("approved");

    // Count documents in both collections
    const pendingCount = await pendingCollection.countDocuments();
    const approvedCount = await approvedCollection.countDocuments();

    res.status(200).json({
      success: true,
      totalPending: pendingCount,
      totalApproved: approvedCount
    });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const accountSummary = async (req, res) => {
  try {
    const db = getDB();

    // Collections
    const usersCollection = db.collection("users");
    const pendingCollection = db.collection("pending");

    // Fetch counts for active users
    const activeStudents = await usersCollection.countDocuments({ role: "student", status: "Active" });
    const activeProfessors = await usersCollection.countDocuments({ role: "prof", status: "Active" });
    const activeAdmins = await usersCollection.countDocuments({ role: "admin", status: "Active" });
    const activeRegistrar = await usersCollection.countDocuments({ role: "registrar", status: "Active"});

    // Fetch counts for pending students & professors
    const pendingStudents = await pendingCollection.countDocuments({ role: "student" });
    const pendingProfessors = await pendingCollection.countDocuments({ role: "prof" });
    const pendingRegistrar = await pendingCollection.countDocuments({ role: "registrar" });
    const pendingAdmins = await pendingCollection.countDocuments({ role: "admin" });

    const inactiveStudents = await usersCollection.countDocuments({ role: "student", status: "Inactive" });
    const inactiveProfessors = await usersCollection.countDocuments({ role: "prof", status: "Inactive" });
    const inactiveAdmins = await usersCollection.countDocuments({ role: "admin", status: "Inactive" });
    const inactiveRegistrar = await usersCollection.countDocuments({ role: "registrar", status: "Inactive"});


    res.status(200).json({
      success: true,
      summary: [
        { accountType: "Student", status: "Active", total: activeStudents },
        { accountType: "Student", status: "Inactive", total: inactiveStudents },
        { accountType: "Student", status: "Pending", total: pendingStudents },
        { accountType: "Instructor", status: "Active", total: activeProfessors },
        { accountType: "Instructor", status: "Inactive", total: inactiveProfessors },
        { accountType: "Instructor", status: "Pending", total: pendingProfessors },
        { accountType: "Admin", status: "Active", total: activeAdmins },
        { accountType: "Admin", status: "Inactive", total: inactiveAdmins },
        { accountType: "Admin", status: "Pending", total: pendingAdmins },
        { accountType: "Registrar", status: "Active", total: activeRegistrar },
        { accountType: "Registrar", status: "Inactive", total: inactiveRegistrar },
        { accountType: "Registrar", status: "Pending", total: pendingRegistrar },
      ],
    });

  } catch (error) {
    console.error("Error fetching account summary:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getArchivedUsers = async (req, res) => {
  const { role, status, page = 1 } = req.body;

  try {
    const db = getDB();
    const usersArchiveCollection = db.collection("users_archive");

    const query = {};

    // Dynamically apply filters if provided
    if (role && role.trim() !== "") {
      query.role = role;
    }

    if (status && status.trim() !== "") {
      query.status = status;
    }

    const pageNumber = parseInt(page);
    const pageSize = 20;
    const skip = (pageNumber - 1) * pageSize;

    // Count total matching users (for pagination metadata)
    const totalUsers = await usersArchiveCollection.countDocuments(query);

    // Fetch users with pagination
    const users = await usersArchiveCollection
      .find(query, { projection: { password: 0 } }) // Exclude password only
      .skip(skip)
      .limit(pageSize)
      .toArray();

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / pageSize),
        totalUsers,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const archiveUser = async (req, res) => {
  const { refId } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const usersArchiveCollection = db.collection("users_archive");

    // 1️⃣ Find user by refId
    const user = await usersCollection.findOne({ refId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // 2️⃣ Copy user to users_archive
    await usersArchiveCollection.insertOne(user);

    // 3️⃣ Delete user from users collection
    await usersCollection.deleteOne({ refId });

    res.status(200).json({ success: true, message: "User archived successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error archiving user", error });
  }
};

export const restoreUser = async (req, res) => {
  const { refId } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const usersArchiveCollection = db.collection("users_archive");

    const archivedUser = await usersArchiveCollection.findOne({ refId });
    if (!archivedUser) {
      return res.status(404).json({ success: false, message: "User not found in archive" });
    }

    await usersCollection.insertOne(archivedUser);

    await usersArchiveCollection.deleteOne({ refId });

    res.status(200).json({ success: true, message: "User restored successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error restoring user", error });
  }
};

export const updateUserStatus = async (req, res) => {
  const { refId, status } = req.body;

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    await usersCollection.updateOne({ refId }, { $set: { status } });

    res.status(200).json({ success: true, message: "User status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status", error });
  }
};

export const logs = async (req, res) => {
  try {
    const { action, userId, name, details } = req.body;

    if (!action || !userId || !name || !details) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const db = getDB();
    const logsCollection = db.collection("logs");

    // 🔍 Find the latest log ID
    const lastLog = await logsCollection.find().sort({ logId: -1 }).limit(1).toArray();
    const newLogId = lastLog.length > 0 ? lastLog[0].logId + 1 : 1; // Auto-increment logId

    // 🕒 Generate formatted date (e.g., "01 Oct 2023")
    const formattedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // ✅ Insert log into collection
    const newLog = {
      logId: newLogId,
      action,
      userId,
      name,
      details,
      date: formattedDate,
    };

    await logsCollection.insertOne(newLog);

    res.status(201).json({ success: true, message: "Log entry added successfully!", log: newLog });
  } catch (error) {
    console.error("Error inserting log:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
