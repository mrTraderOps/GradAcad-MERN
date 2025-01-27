import { getDB } from '../config/db.js';



export const registerStudent = async (req, res) => {

}

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

export const deleteStudent = async (req, res) => {

}



