import { getDB } from '../config/db.js';


export const getTerms = async (req, res) => {
  const db = getDB();

  try {
    const data = await db.collection('grades')
      .find(
        { currentTerm: { $exists: true } },
        { projection: { currentAcadYr: 1, currentSem: 1, currentTerm: 1, _id: 0 } }
      )
      .toArray();

    // Format the response
    const formattedData = data.map((doc) => {
      return {
        acadYr: doc.currentAcadYr, // Directly use the string value
        sem: doc.currentSem[0], // Extract the first object from currentSem
        term: doc.currentTerm[0], // Extract the first object from currentTerm
      };
    });

    res.json({ success: true, data: formattedData });
  } catch (err) {
    console.error('Error fetching terms:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllGrades = async (req, res) => {
  const { dept, acadYr, sem, sect, subjCode, terms } = req.body;

  const db = getDB();

  try {
    const gradesData = await db.collection('grades').findOne(
      {
        dept: dept,
        acadYr: acadYr,
        sem: sem,
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
        !update.acadYr ||
        !update.sem ||
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
            acadYr: update.acadYr,
            sem: update.sem,
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

    res.status(200).json({ success: "true", message: "Grade inserted/updated successfully" });
  } catch (error) {
    console.error("Error inserting/updating grade:", error);
    res.status(500).json({ success: "true", message: "Internal server error" });
  }
};

export const generateReport = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: "Username is required." });
  }

  try {
    const db = getDB();

    // Step 1: Find all instructor documents where the username exists
    const instructorDocs = await db.collection("instructors").find({
      [username]: { $exists: true }
    }).toArray();

    if (!instructorDocs.length) {
      return res.status(404).json({ success: false, message: "No records found." });
    }

    // Step 2: Process data and group by acadYr & sem
    const groupedData = {};

    instructorDocs.forEach((doc) => {
      const acadYrKey = doc.acadYr;
      const semKey = doc.sem;

      if (!groupedData[acadYrKey]) {
        groupedData[acadYrKey] = {};
      }
      if (!groupedData[acadYrKey][semKey]) {
        groupedData[acadYrKey][semKey] = [];
      }

      // Step 3: Extract subject details (without filtering)
      let subjects = doc[username] || [];

      // Step 4: Add subjects to the correct acadYr & sem group
      groupedData[acadYrKey][semKey].push(...subjects);
    });

    // Step 5: Convert groupedData into response format
    const formattedData = Object.entries(groupedData).map(([acadYr, semesters]) =>
      Object.entries(semesters).map(([sem, details]) => ({
        acadYr,
        sem,
        details
      }))
    ).flat();

    res.status(200).json({ success: true, data: formattedData });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};