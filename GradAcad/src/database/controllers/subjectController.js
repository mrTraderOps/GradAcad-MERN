import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb"

export const getSubjectsByUsername = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    try {
        const db = getDB();
        const collection = db.collection("instructors");

        // Find all documents in the collection
        const documents = await collection.find({}).toArray();

        // Check if any document contains the username as a key
        let subjects = null;
        for (const doc of documents) {
            if (doc[username]) {
                subjects = doc[username];
                break;
            }
        }

        if (subjects) {
            res.status(200).json({ success: true, subjects });
        } else {
            return res.status(404).json({ success: false, message: "No data found for the given username" });
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getSubjectsByRefId = async (req, res) => {
    const { refId, acadYr, sem } = req.body;

    if (!refId) {
        return res.status(400).json({ message: "refId is required" });
    }

    try {
        const db = getDB();
        const enrollmentCollection = db.collection("enrollment");
        const subjectsCollection = db.collection("subjects"); // Assuming subjects are stored separately

        // Build dynamic query
        const query = { profId: refId };
        if (acadYr) query.acadYr = acadYr;
        if (sem) query.sem = sem;

        // Fetch enrollment data based on dynamic filters
        const enrollmentRecords = await enrollmentCollection.find(query).toArray();

        if (!enrollmentRecords.length) {
            return res.status(404).json({ success: false, message: "No subjects found for the specified academic year and semester" });
        }

        // Extract unique subject IDs
        const subjectIds = enrollmentRecords.map(record => record.subjectId);

        // Fetch subject details based on extracted subject IDs
        const subjectDetails = await subjectsCollection
            .find({ _id: { $in: subjectIds } })
            .toArray();

        // Combine enrollment data with subject details
        const combinedData = enrollmentRecords.map(record => {
            const subjectDetail = subjectDetails.find(sub => sub._id === record.subjectId);

            return {
                dept: record.dept || "Unknown",
                subjectCode: record.subjectId,
                subjectName: subjectDetail?.subjectName || "Unknown",
                section: record.sect,
                acadYr: record.acadYr,
                sem: record.sem
            };
        });

        res.status(200).json({ success: true, subjects: combinedData });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getAcadYrSem = async (req, res) => {

    const db = getDB();

    try {
        const YrSem = await db.collection('global')
            .findOne(
                { acadYr: { $exists: true }, sem: { $exists: true } }, // Filter for documents with acadYr and sem fields
                { projection: { acadYr: 1, sem: 1, _id: 0 } } // Include only acadYr and sem fields in the result
            );
    
        if (YrSem) {
            res.json({ success: true, data: YrSem });
        } else {
            res.status(404).json({ success: false, message: 'No matching document found' });
        }
    } catch (err) {
        console.error('Error fetching academic year and semester:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getAllSubjectsEnrollment = async (req, res) => {
    try {
      const db = getDB();
  
      // 🔍 Step 1: Query enrollment collection and join with subjects and users collection
      const enrollmentDocs = await db.collection("enrollment").aggregate([
        {
          $lookup: {
            from: "subjects", // 🔗 Join with subjects collection
            localField: "subjectId", // 🔍 Match 'subjectId' in 'enrollment'
            foreignField: "_id", // 🔍 Match '_id' in 'subjects'
            as: "subjectDetails", // 🔄 Store result in 'subjectDetails'
          },
        },
        {
          $lookup: {
            from: "users", // 🔗 Join with users collection to get instructor details
            localField: "profId", // 🔍 Match 'profId' in 'enrollment'
            foreignField: "refId", // 🔍 Match '_id' in 'users'
            as: "profDetails", // 🔄 Store result in 'profDetails'
          },
        },
        {
          $project: {
            acadYr: 1,
            sem: 1,
            subjectId: 1,
            dept: 1,
            sect: 1,
            _id: 1, // Include the _id of the enrollment document
            profId: 1, // Include the profId
            subjectName: { $arrayElemAt: ["$subjectDetails.subjectName", 0] }, // 🎯 Extract subjectName
            instructor: { $arrayElemAt: ["$profDetails.name", 0] }, // 🎯 Extract instructor's name
          },
        },
      ]).toArray();
  
      if (!enrollmentDocs.length) {
        return res.status(404).json({ success: false, message: "No records found." });
      }
  
      res.status(200).json({ success: true, data: enrollmentDocs });
  
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};

export const getAllSubjectsArchived = async (req, res) => {
    try {
      const db = getDB();
  
      // 🔍 Step 1: Query enrollment collection and join with subjects and users collection
      const enrollmentDocs = await db.collection("enrollment_archive").aggregate([
        {
          $lookup: {
            from: "subjects", // 🔗 Join with subjects collection
            localField: "subjectId", // 🔍 Match 'subjectId' in 'enrollment'
            foreignField: "_id", // 🔍 Match '_id' in 'subjects'
            as: "subjectDetails", // 🔄 Store result in 'subjectDetails'
          },
        },
        {
          $lookup: {
            from: "users", // 🔗 Join with users collection to get instructor details
            localField: "profId", // 🔍 Match 'profId' in 'enrollment'
            foreignField: "refId", // 🔍 Match '_id' in 'users'
            as: "profDetails", // 🔄 Store result in 'profDetails'
          },
        },
        {
          $project: {
            acadYr: 1,
            sem: 1,
            subjectId: 1,
            dept: 1,
            sect: 1,
            _id: 1, // Include the _id of the enrollment document
            profId: 1, // Include the profId
            subjectName: { $arrayElemAt: ["$subjectDetails.subjectName", 0] }, // 🎯 Extract subjectName
            instructor: { $arrayElemAt: ["$profDetails.name", 0] }, // 🎯 Extract instructor's name
          },
        },
      ]).toArray();
  
      if (!enrollmentDocs.length) {
        return res.status(404).json({ success: false, message: "No records found." });
      }
  
      res.status(200).json({ success: true, data: enrollmentDocs });
  
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ success: false, message: "Server error.", error: error.message });
    }
};
  
export const getAllInstructor = async (req, res) => {
    try {
      const db = getDB();
      const usersCollection = db.collection("users");
  
      const users = await usersCollection.find({role: "prof"}, { projection: { name: 1, refId: 1, _id: 0} }).toArray();
  
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
 
export const updateSubjectOffered = async (req, res) => {
    try {
        const db = getDB();
        const { _id, subjectId, acadYr, sem, dept, sect, subjectName, profId } = req.body;

        if (!subjectId || !acadYr || !sem || !dept || !sect) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const subjectsCollection = db.collection("subjects");
        const enrollmentCollection = db.collection("enrollment");

        // ✅ Step 1: Update or insert into 'subjects' collection
        await subjectsCollection.updateOne(
            { _id: subjectId },
            { $set: { subjectName } },
            { upsert: true } // Insert if not exists
        );

        // ✅ Step 3: Update or insert into 'enrollment' collection
        const filter = _id && _id.trim() !== "" ? { _id: new ObjectId(_id) } : {}; // Allow MongoDB to auto-generate if missing

        await enrollmentCollection.updateOne(
            filter,
            {
                $set: {
                    subjectId,
                    acadYr,
                    sem,
                    dept,
                    sect,
                    profId: profId || null,
                },
                $setOnInsert: { enrollee: [] },
            },
            { upsert: true }
        );

        res.status(200).json({ success: true, message: "Subject offering updated successfully" });

    } catch (error) {
        console.error("Error updating subject offering:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const restoreSubject = async (req, res) => {
    const { _id } = req.body;
  
    try {
      const db = getDB();
      const enrollmentCollection = db.collection("enrollment");
      const archiveCollection = db.collection("enrollment_archive");
  
      const archivedSubject = await archiveCollection.findOne({ _id: new ObjectId(_id) });
      if (!archivedSubject) {
        return res.status(404).json({ success: false, message: "Subject not found in archive" });
      }
  
      await enrollmentCollection.insertOne(archivedSubject);
  
      await archiveCollection.deleteOne({ _id: new ObjectId(_id) });
  
      res.status(200).json({ success: true, message: "Subject restored successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error restoring subject", error });
    }
};

export const archiveSubject = async (req, res) => {
    const { _id } = req.body;
  
    try {
      const db = getDB();
      const enrollmentCollection = db.collection("enrollment");
      const archiveCollection = db.collection("enrollment_archive");
  
      const enrollment = await enrollmentCollection.findOne({ _id: new ObjectId(_id) });
      if (!enrollment) {
        return res.status(404).json({ success: false, message: "Subject not found in archive" });
      }
  
      await archiveCollection.insertOne(enrollment);
  
      await enrollmentCollection.deleteOne({ _id: new ObjectId(_id) });
  
      res.status(200).json({ success: true, message: "Subject restored successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error restoring subject", error });
    }
};


