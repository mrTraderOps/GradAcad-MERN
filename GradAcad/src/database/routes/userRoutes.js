import express from 'express';
import { loginUser, registerUser, updateUser, deleteUser, approveAccount, getPendingUsers, getAllUsers, rejectAccount, getManageUsers, auditUsers, pendingApprovedUsers, accountSummary, logs, changePassword, getArchivedUsers, restoreUser, archiveUser, updateUserStatus } from '../controllers/userController.js';

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Register route
router.post('/register', registerUser);

// Fetch all User
router.get('/getAllUsers', getAllUsers);

// Fetch all User to Manage
router.get('/getManageUsers', getManageUsers);

// Get all Pending
router.get('/getPendingUsers', getPendingUsers);

router.get('/getArchivedUsers', getArchivedUsers);

// Post Audit Users
router.post('/getAuditUsers', auditUsers);

router.post('/restoreUser', restoreUser);

router.post('/archiveUser', archiveUser);

// Update a user
router.put('/updateByRefId', updateUser);

router.put('/updateUserStatus', updateUserStatus);

// Change Password
router.post('/changePassword', changePassword);

// Delete a user
router.delete('/deleteByRefId', deleteUser);

// Approve a user
router.post('/approveAccount', approveAccount);

// Reject a user
router.post('/rejectAccount', rejectAccount);

router.get('/pendingApprovedUsers', pendingApprovedUsers)

router.get('/accountSummary', accountSummary)

router.post('/logs', logs)

export default router;
