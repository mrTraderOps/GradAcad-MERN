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

export const getUserById = async (req, res) => {

}

export const updateUser = async (req, res) => {

}

export const deleteUser = async (req, res) => {

}



