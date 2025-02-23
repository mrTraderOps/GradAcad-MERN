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

export const getAllGrades = async (req, res) => {
    const { dept, sect, subjCode, terms } = req.body;

    const db = getDB();

    try {
        const gradesData = await db.collection('grades').findOne(
            { 
                dept: dept,
                sect: sect,
                subjCode: subjCode 
            },
            { projection: { _id: 0, subjCode: 1, grades: 1 } }
        );

        if (!gradesData) {
            return res.status(404).json({ success: false, message: 'No grades found.' });
        }

        // Filter students' grades based on selected terms
        const filteredGrades = gradesData.grades.map(student => ({
            StudentId: student.StudentId,
            terms: terms && terms.length > 0 
                ? Object.fromEntries(
                    terms
                        .filter(term => student.terms.hasOwnProperty(term)) // Only include requested terms
                        .map(term => [term, student.terms[term]]) // Convert to key-value format
                  )
                : student.terms // If no specific terms are requested, return all
        }));

        res.json({ success: true, data: filteredGrades });

    } catch (err) {
        console.error('Error fetching grades:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getAllGradesV2 = async (req, res) => {

    const { department, section, subjectCode, terms } = req.body;
    const db = getDB();

    try {
        const studentsWithGrades = await db.collection("students").aggregate([
            {
                $lookup: {
                    from: "grades",  // The name of the grades collection
                    let: { studentId: "$StudentId", dept: "$Department", sect: "$Section" }, // Passing variables
                    pipeline: [
                        { $match: { subjCode: subjectCode } }, // Filter by subject code
                        { $unwind: "$grades" }, // Flatten the grades array
                        { $match: { $expr: { $eq: ["$grades.StudentId", "$$studentId"] } } }, // Match StudentId
                        { $match: { dept: department, sect: section } }, // Filter by dept & section
                        {
                            $project: {
                                _id: 0,
                                terms: {
                                    $filter: {
                                        input: { $objectToArray: "$grades.terms" },
                                        as: "term",
                                        cond: { $in: ["$$term.k", terms] } // Filter by selected terms
                                    }
                                }
                            }
                        }
                    ],
                    as: "gradesData"
                }
            },
            {
                $project: {
                    StudentId: 1,
                    FirstName: 1,
                    LastName: 1,
                    MiddleInitial: 1,
                    grades: { $arrayElemAt: ["$gradesData.terms", 0] } // Extract terms directly
                }
            }
        ]).toArray();

        res.json({ success: true, data: studentsWithGrades });

    } catch (err) {
        console.error("Error fetching student grades:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


