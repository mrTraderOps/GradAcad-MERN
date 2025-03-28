import { getDB } from "../config/db.js";

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
