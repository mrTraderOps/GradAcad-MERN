import { getDB } from "../config/db.js";

export const getSubjectsByUsername = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    try {
        const db = getDB();
        const collection = db.collection("instructors");

        const result = await collection.findOne(
            { [username]: { $exists: true } },
            { projection: { [username]: 1, _id: 0 } }
        );

        if (result) {
            res.status(200).json({ subjects: result[username] })
        } else {
            return res.status(404).json({ message: "No data found for the given username" });
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Server error" });
    }
};
