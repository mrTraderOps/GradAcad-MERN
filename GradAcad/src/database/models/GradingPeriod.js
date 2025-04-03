// models/GradingPeriod.js
import mongoose from "mongoose";

const gradingPeriodSchema = new mongoose.Schema({
  acadYr: { type: String, required: true },
  semester: { type: String, required: true }, // "First" or "Second"
  term: { type: String, required: true },    // "prelim", "midterm", "final"
  status: { 
    type: String, 
    enum: ["pending", "active", "completed"],
    default: "pending"
  },
  startAt: { type: Date },    // When grading opens
  endAt: { type: Date },      // When grading closes
  actions: {
    prelimDone: Boolean,
    midtermDone: Boolean,
    finalDone: Boolean,
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("GradingPeriod", gradingPeriodSchema);