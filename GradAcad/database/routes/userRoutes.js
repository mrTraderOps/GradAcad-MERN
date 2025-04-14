import express from 'express';
import { authenticateJWT } from '../utils/jwt.js';
import { updateUser, deleteUser, approveAccount, getPendingUsers, rejectAccount, getManageUsers, auditUsers, pendingApprovedUsers, accountSummary, logs, changePassword, getArchivedUsers, restoreUser, archiveUser, updateUserStatus, getAllUsersForGradeRequest, getAllApprovedUsers} from '../controllers/userController.js';

const router = express.Router();

router.use(authenticateJWT)

router.post('/getAllApprovedUsers', getAllApprovedUsers);

router.get('/getAllUsersForGradeRequest', getAllUsersForGradeRequest);

router.post('/getManageUsers', getManageUsers);

router.post('/getPendingUsers', getPendingUsers);

router.post('/getArchivedUsers', getArchivedUsers);

router.post('/getAuditUsers', auditUsers);

router.post('/restoreUser', restoreUser);

router.post('/archiveUser', archiveUser);

router.put('/updateByRefId', updateUser);

router.put('/updateUserStatus', updateUserStatus);

router.post('/changePassword', changePassword);

router.delete('/deleteByRefId', deleteUser);

router.post('/approveAccount', approveAccount);

router.post('/rejectAccount', rejectAccount);

router.get('/pendingApprovedUsers', pendingApprovedUsers)

router.get('/accountSummary', accountSummary)

router.post('/logs', logs)

export default router;
