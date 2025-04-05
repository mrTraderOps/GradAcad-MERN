import { generateToken } from '../utils/jwt.js';
import { getDB } from '../config/db.js';
import bcrypt from "bcrypt";


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

    const token = generateToken(user._id, user.role);

    // If everything is valid, return the user details
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        refId: user.refId,
        status: user.status
      },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Register User
export const registerUser = async (req, res) => {
    const { email, name, password, role, employeeId, studentId } = req.body;
  
    // Validate required fields
    if (!email || !name || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields except Student ID are required." });
    }
  
    try {
      const db = getDB();
      const usersCollection = db.collection("pending");
  
      // Check if user already exists
      const existingEmail = await usersCollection.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Email already exists." });
      }

      // Check if user already exists
      const existingId = await usersCollection.findOne({ refId: employeeId || studentId  });
      if (existingId) {
        return res.status(400).json({ success: false, message: "User ID is already exists." });
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
  
      if (role === "student" && studentId) {
        newUser.studentId = studentId;
      } else {
        newUser.employeeId = employeeId
      }
  
      // Insert user into database
      await usersCollection.insertOne(newUser);
  
      res.status(201).json({ success: true, message: "User registered successfully! Admin will process your registration application, we will send an email once approved." });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

// Get Counts All role for Auto Generated ID
export const getCountUsersRole = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const archiveCollection = db.collection("users_archive");

    // Aggregate role counts from users collection
    const userRoleCounts = await usersCollection
      .aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Aggregate role counts from users_archive collection
    const archiveRoleCounts = await archiveCollection
      .aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Merge the two role count arrays
    const combinedCounts = {};

    // Helper to accumulate counts
    const accumulateCounts = (data) => {
      data.forEach(({ _id, count }) => {
        if (_id) {
          combinedCounts[_id] = (combinedCounts[_id] || 0) + count;
        }
      });
    };

    accumulateCounts(userRoleCounts);
    accumulateCounts(archiveRoleCounts);

    res.status(200).json({ success: true, roleCounts: combinedCounts });
  } catch (error) {
    console.error("Error fetching user role counts:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};