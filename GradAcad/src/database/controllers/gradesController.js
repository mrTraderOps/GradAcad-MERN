import { getDB } from '../config/db.js';



export const getTerms = async (req, res) => {

    const db = getDB();

    try {

        const term = await db.collection('grades')
            .find({ term: { $exists: true } }, { projection: { term: 1, _id: 0 } })
            .toArray();

        res.json({ success: true, data: term });
    } catch (err) {
        console.error('Error fetching terms:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}



