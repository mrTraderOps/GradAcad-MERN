import { getDB } from '../../db.js';



export const registerStudent = async (req, res) => {

}

export const addStudent = async (req, res) => {
    const db = getDB();

    try {
        const { subjectId, acadYr, sem, dept, sect, studentId, lastName, middleInitial, firstName } = req.body;

        if (!subjectId || !acadYr || !sem || !dept || !sect || !studentId || !lastName || !firstName) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Insert student ID into enrollee array in enrollment collection
        const enrollmentCollection = db.collection("enrollment");
        await enrollmentCollection.updateOne(
        { subjectId, acadYr, sem, dept, sect },
        { $addToSet: { enrollee: studentId } },
        );

        // Insert student data into grades collection
        const gradesCollection = db.collection("grades");
        await gradesCollection.insertOne({
        StudentId: studentId,
        SubjectId: subjectId,
        terms: { PRELIM: null, MIDTERM: null, FINAL: null },
        });

        // Insert student information into students collection
        const studentsCollection = db.collection("students");
        await studentsCollection.updateOne(
        { _id: studentId },
        {
            $set: {
            LastName: lastName,
            FirstName: firstName,
            MiddleInitial: middleInitial || "",
            SectionId: `${dept}-${sect}`,
            },
        },
        { upsert: true } // Ensures student data is updated or inserted
        );

        res.status(200).json({ success: true, message: "Student added successfully" });
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    };
}

export const deleteStudent = async (req, res) => {
    const db = getDB();

    try {
        const { subjectId, acadYr, sem, dept, sect, studentId } = req.body;

        if (!subjectId || !acadYr || !sem || !dept || !sect || !studentId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Remove student ID from enrollee array in enrollment collection
        const enrollmentCollection = db.collection("enrollment");
        await enrollmentCollection.updateOne(
            { subjectId, acadYr, sem, dept, sect },
            { $pull: { enrollee: studentId } } // ✅ Removes student ID from enrollee array
        );

        // Delete student record from grades collection
        const gradesCollection = db.collection("grades");
        await gradesCollection.deleteOne({ StudentId: studentId, SubjectId: subjectId });

        res.status(200).json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getStudentByDeptSect = async (req, res) => {

    const { department, section } = req.body;

    if (!department || !section) {
        return res.status(400).json({ message: "Department and section are required" });
    }

    try {
        const db = getDB();
        const collection = db.collection("students");

        // Construct dynamic query using department and section
        const query = {};
        query[`${department}.${section}`] = { $exists: true };

        // Construct dynamic projection
        const projection = {};
        projection[`${department}.${section}`] = 1;
        projection["_id"] = 0;

        // Query the database
        const sectionData = await collection.findOne(query, { projection });

        if (!sectionData) {
            return res.status(404).json({ message: "No data found for the given department and section" });
        }

        // Extract the section array dynamically
        const students = sectionData[department][section];

        res.status(200).json({ students });
    } catch (error) {
        console.error("Error fetching section data:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getStudentById = async (req, res) => {

}

export const updateStudent = async (req, res) => {

}




