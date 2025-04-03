import { getDB } from '../../db.js';

let cronInterval = null; // Track the interval for cleanup

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
  // Clear existing interval to prevent duplicates
  if (cronInterval) {
    clearInterval(cronInterval);
  }

  // Run every minute (60,000 ms)
  cronInterval = setInterval(checkGradingPeriods, 60 * 1000);
  
  // Immediate first check
  checkGradingPeriods();
  console.log('Grading period cron job started (checking every minute)');
};

// Optional: Cleanup function for server shutdown
export const stopGradingPeriodCron = () => {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
  }
};