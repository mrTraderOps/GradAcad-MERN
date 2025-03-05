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

        const filteredGrades = gradesData.grades.map(student => ({
            StudentId: student.StudentId,
            terms: terms && terms.length > 0 
                ? Object.fromEntries(
                    terms
                        .filter(term => student.terms.hasOwnProperty(term)) 
                        .map(term => [term, student.terms[term]]) 
                  )
                : student.terms
        }));

        res.json({ success: true, data: filteredGrades });

    } catch (err) {
        console.error('Error fetching grades:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateGrade = async (req, res) => {
  const { updates } = req.body;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid updates array",
    });
  }

  const db = getDB();

  try {
    const bulkOps = updates.map((update) => {

      if (
        !update.dept ||
        !update.sect ||
        !update.subjCode ||
        !update.StudentId ||
        !update.term ||
        update.grade === undefined
      ) {
        throw new Error("Missing required fields in one or more updates");
      }

      return {
        updateOne: {
          filter: {
            dept: update.dept,
            sect: update.sect,
            subjCode: update.subjCode,
            "grades.StudentId": update.StudentId,
          },
          update: {
            $set: {
              [`grades.$.terms.${update.term}`]: update.grade,
            },
          },
        },
      };
    });

    const result = await db.collection("grades").bulkWrite(bulkOps);

    if (result.matchedCount === updates.length) {
      res.status(200).json({
        success: true,
        message: "Grades updated successfully",
        result,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Some students not found",
        result,
      });
    }
  } catch (err) {
    console.error("Error updating grades:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const insertGrade = async (req, res) => {
  const { dept, sect, subjCode, StudentId, term, grade } = req.body;

  if (!dept || !sect || !subjCode || !StudentId || !term || !grade) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const db = req.db; 
    const collection = db.collection("grades"); 


    const filter = { dept, sect, subjCode };


    const existingDoc = await collection.findOne(filter);

    if (existingDoc) {
     
      const studentIndex = existingDoc.grades.findIndex(
        (g) => g.StudentId === StudentId
      );

      if (studentIndex !== -1) {
        // If the StudentId exists, update the specific term grade
        const updateQuery = {
          $set: {
            [`grades.${studentIndex}.terms.${term}`]: grade,
          },
        };

        await collection.updateOne(filter, updateQuery);
      } else {
        const newGradeEntry = {
          StudentId,
          terms: {
            [term]: grade,
          },
        };

        const updateQuery = {
          $push: {
            grades: newGradeEntry,
          },
        };

        await collection.updateOne(filter, updateQuery);
      }
    } else {
      // If the document doesn't exist, create a new one
      const newDoc = {
        dept,
        sect,
        subjCode,
        grades: [
          {
            StudentId,
            terms: {
              [term]: grade,
            },
          },
        ],
      };

      await collection.insertOne(newDoc);
    }

    res.status(200).json({ success: "true" , message: "Grade inserted/updated successfully" });
  } catch (error) {
    console.error("Error inserting/updating grade:", error);
    res.status(500).json({ success: "true" , message: "Internal server error" });
  }
};