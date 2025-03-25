import { getDB } from '../config/db.js';
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

// Login User
export const loginUser = async (req, res) => {
  const { email, studentId, password } = req.body;

  const db = getDB();

  // Function to determine the username
  const getUsername = () => {
    if (email) {
      return { email }; // Query by email
    } else if (studentId) {
      return { studentId }; // Query by studentId
    } else {
      return null;
    }
  };

  const query = getUsername();

  if (!query) {
    return res.status(400).json({ success: false, message: 'Email or Student ID is required' });
  }

  try {
    // Find the user by email or studentId
    const user = await db.collection('users').findOne(query);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or student ID' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // If everything is valid, return the user details
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        refId: user.refId
      },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const registerUser = async (req, res) => {
    const { email, name, password, role, studentId } = req.body;
  
    // Validate required fields
    if (!email || !name || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields except Student ID are required." });
    }
  
    try {
      const db = getDB();
      const usersCollection = db.collection("pending");
  
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists." });
      }
  
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Format date as MM/DD/YYYY HH:mm AM/PM
    const formatDate = () => {
        const now = new Date();
        const options = { month: "2-digit", day: "2-digit", year: "numeric" };
        const datePart = now.toLocaleDateString("en-US", options);
  
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert to 12-hour format
  
        return `${datePart} ${hours}:${minutes} ${ampm}`;
      };
  
      // Create user object
      const newUser = {
        email,
        name,
        password: hashedPassword,
        role,
        createdAt: formatDate(),
      };
  
      // Only include studentId if role is student AND studentId is provided
      if (role === "student" && studentId) {
        newUser.studentId = studentId;
      }
  
      // Insert user into database
      await usersCollection.insertOne(newUser);
  
      res.status(201).json({ success: true, message: "User registered successfully." });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

export const getPendingUsers = async (req, res) => {
  try {
      const db = getDB();
      const collection = db.collection("pending");

      // Fetch all documents, excluding the password field
      const pending = await collection.find({}, { projection: { password: 0 } }).toArray();

      if (pending.length > 0) {
          res.status(200).json({ success: true, pending });
      } else {
          res.status(404).json({ success: false, message: "No users found" });
      }
  } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const approvedCollection = db.collection("approved");

    // Perform an aggregation to join users with approved data
    const users = await usersCollection
      .aggregate([
        {
          $lookup: {
            from: "approved",
            localField: "refId", // Field in users collection
            foreignField: "employeeId", // Matching field in approved collection
            as: "approvalData",
          },
        },
        {
          $project: {
            password: 0, // Exclude password
            "approvalData._id": 0, // Remove _id from joined data
          },
        },
        {
          $addFields: {
            approvedAt: { $arrayElemAt: ["$approvalData.approvedAt", 0] }, // Extract first match
          },
        },
        {
          $project: {
            approvalData: 0, // Remove array field after extracting approvedAt
          },
        },
      ])
      .toArray();

    if (users.length > 0) {
      res.status(200).json({ success: true, users });
    } else {
      res.status(404).json({ success: false, message: "No users found" });
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getManageUsers = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}, { projection: { password: 0, role: 0 } }).toArray();

    if (users.length > 0) {
      res.status(200).json({ success: true, users });
    } else {
      res.status(404).json({ success: false, message: "No users found" });
    }
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

    // Fetch logs with pagination
    const logs = await logsCollection
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
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
    const activeStudents = await usersCollection.countDocuments({ role: "student" });
    const activeProfessors = await usersCollection.countDocuments({ role: "prof" });
    const activeAdmins = await usersCollection.countDocuments({ role: "admin" });
    const activeRegistrar = await usersCollection.countDocuments({ role: "registrar" });

    // Fetch counts for pending students & professors
    const pendingStudents = await pendingCollection.countDocuments({ role: "student" });
    const pendingProfessors = await pendingCollection.countDocuments({ role: "prof" });
    const pendingRegistrar = await pendingCollection.countDocuments({ role: "registrar" });
    const pendingAdmins = await pendingCollection.countDocuments({ role: "admin" });

    res.status(200).json({
      success: true,
      summary: [
        { accountType: "Student", status: "Active", total: activeStudents },
        { accountType: "Student", status: "Pending", total: pendingStudents },
        { accountType: "Instructor", status: "Active", total: activeProfessors },
        { accountType: "Instructor", status: "Pending", total: pendingProfessors },
        { accountType: "Admin", status: "Active", total: activeAdmins },
        { accountType: "Admin", status: "Pending", total: pendingAdmins },
        { accountType: "Registrar", status: "Active", total: activeRegistrar },
        { accountType: "Registrar", status: "Pending", total: pendingRegistrar },
      ],
    });

  } catch (error) {
    console.error("Error fetching account summary:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
