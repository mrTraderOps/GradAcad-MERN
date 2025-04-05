import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/db.js';

// Generate a JWT token
export const generateToken = (userId, userRole) => {
    return jwt.sign(
        { userId: userId, role: userRole }, 
        JWT_SECRET,
        { expiresIn: '1d' } // Token expires in 1 day
    );
};

// Middleware to verify JWT token
export const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer token"

    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: "Invalid or Expired Token" });
    }
};
