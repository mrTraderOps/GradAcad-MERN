import { getDB } from '../config/db.js';
import cron from 'node-cron';

// Store the cron task reference for cleanup
let cronTask = null;

const checkGradingPeriods = async () => {
  try {
    const db = getDB();
    const globalCollection = db.collection('global');
    const now = new Date();

    // Get the current grading period
    const gradingPeriod = await globalCollection.findOne({});
    if (!gradingPeriod) {
      console.log('No grading period document found');
      return;
    }

    const { scheduling, currentTerm = [{}] } = gradingPeriod;

    // Skip if no scheduling is set
    if (!scheduling?.startAt && !scheduling?.endAt) {
      return;
    }

    // Check if grading period should OPEN
    if (scheduling.startAt && new Date(scheduling.startAt) <= now && !scheduling.isActive) {
      await globalCollection.updateOne({}, {
        $set: {
          "scheduling.isActive": true,
          "scheduling.lastCronCheck": now,
        }
      });
      console.log(`[${now.toISOString()}] Opened grading period`);
    }

    // Check if grading period should CLOSE
    if (scheduling.endAt && new Date(scheduling.endAt) <= now && scheduling.isActive) {
      const update = {
        startDate: "",
        endDate: "",
        setSem: "",
        setTerm: "",
        startTime: "",
        endTime: "",
        "scheduling.isPending": false,
        "scheduling.isActive": false,
        "scheduling.lastCronCheck": now
      };

      // Auto-mark current term as done
      if (currentTerm[0]?.prelim) update.isDonePrelim = true;
      if (currentTerm[0]?.midterm) update.isDoneMidterm = true;
      if (currentTerm[0]?.final) update.isDoneFinal = true;

      await globalCollection.updateOne({}, { $set: update });
      console.log(`[${now.toISOString()}] Closed grading period`);
    }
  } catch (error) {
    console.error('Error in grading period check:', error);
  }
};

export const initGradingPeriodCron = () => {
  // Clear existing cron job if any
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }

  // Schedule daily at midnight Philippine Time (UTC+8)
  cronTask = cron.schedule('0 0 * * *', () => {
    console.log('⏰ [Cron Job] Running daily grading period check (12:00 AM PHT)');
    checkGradingPeriods();
  }, {
    scheduled: true,
    timezone: 'Asia/Manila' // Philippine Time
  });

  // Immediate first check (optional)
  checkGradingPeriods();
  console.log('✅ [Cron Job] Scheduled daily at 12:00 AM PHT (UTC+8)');
};

export const stopGradingPeriodCron = () => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('🛑 [Cron Job] Stopped grading period checker');
  }
};