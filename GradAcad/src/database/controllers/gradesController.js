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

export const getTermsV2 = async (req, res) => {
  const db = getDB();

  try {
    const data = await db.collection('global')
      .find(
        { currentTerm: { $exists: true } },
        { projection: { currentAcadYr: 1, currentSem: 1, currentTerm: 1, _id: 0, isDonePrelim: 1, isDoneMidterm: 1, isDoneFinal: 1 } }
      )
      .toArray();

    // Format the response
    const formattedData = data.map((doc) => {
      return {
        acadYr: doc.currentAcadYr, // Directly use the string value
        sem: doc.currentSem[0], // Extract the first object from currentSem
        term: doc.currentTerm[0], // Extract the first object from currentTerm
        prelimDone: doc.isDonePrelim,
        midtermDone: doc.isDoneMidterm,
        finalDone: doc.isDoneFinal,
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
  const { refId } = req.body;

  if (!refId) {
    return res.status(400).json({ success: false, message: "Instructor ID is required." });
  }

  try {
    const db = getDB();

    // 🔍 Step 1: Query enrollment collection and join with subjects collection
    const instructorDocs = await db.collection("enrollment").aggregate([
      {
        $match: { profId: refId }, // 🔥 Filter by Instructor ID
      },
      {
        $lookup: {
          from: "subjects", // 🔗 Join with subjects collection
          localField: "subjectId", // 🔍 Match 'subjectId' in 'enrollment'
          foreignField: "_id", // 🔍 Match '_id' in 'subjects'
          as: "subjectDetails", // 🔄 Store result in 'subjectDetails'
        },
      },
      {
        $project: {
          acadYr: 1,
          sem: 1,
          subjectId: 1,
          dept: 1,
          sect: 1,
          subjectName: { $arrayElemAt: ["$subjectDetails.subjectName", 0] }, // 🎯 Extract subjectName
        },
      },
    ]).toArray();

    if (!instructorDocs.length) {
      return res.status(404).json({ success: false, message: "No records found." });
    }

    res.status(200).json({ success: true, data: instructorDocs });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

export const getStudentGrades = async (req, res) => {
  try {
    const { acadYr, sem, subjectId, selectedTerms, dept, section } = req.body;

    if (!acadYr || !sem || !subjectId) {
      return res.status(400).json({ success: false, message: "Invalid request parameters." });
    }

    const db = getDB();

    // Find students enrolled in a subject for a given academic year and semester
    const enrollment = await db.collection("enrollment").findOne({ acadYr, sem, subjectId, section, dept });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "No enrollment records found." });
    }

    const enrolledStudentIds = enrollment.enrollee;

    // Fetch students from the students collection
    const students = await db.collection("students")
      .find({ _id: { $in: enrolledStudentIds } })
      .toArray();

    // Fetch grades for the enrolled students
    const grades = await db.collection("grades")
      .find({ StudentId: { $in: enrolledStudentIds }, SubjectId: subjectId })
      .toArray();

    // Determine whether to filter terms or return all
    const shouldFetchAllTerms = !selectedTerms || !Array.isArray(selectedTerms) || selectedTerms.length === 0 || selectedTerms.every(term => term.trim() === "");

    // Merge student details with grades
    const combinedData = enrolledStudentIds.map((studentId) => {
      const student = students.find((s) => s._id === studentId);
      const grade = grades.find((g) => g.StudentId === studentId);

      return {
        StudentId: studentId,
        LastName: student?.LastName || "",
        FirstName: student?.FirstName || "",
        MiddleInitial: student?.MiddleInitial || "",
        prelimRemarks: grade?.prelimRemarks || "",
        midtermRemarks: grade?.midtermRemarks || "",
        finalRemarks: grade?.finalRemarks || "",
        terms: shouldFetchAllTerms
          ? grade?.terms || {} // Fetch all terms if no filter is applied
          : Object.fromEntries(
              Object.entries(grade?.terms || {}).filter(([key]) => selectedTerms.includes(key))
            ),
      };
    });

    return res.status(200).json({ success: true, data: combinedData });

  } catch (error) {
    console.error("Error fetching student grades:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const updateGradeV2 = async (req, res) => {
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
        !update.SubjectId ||
        !update.StudentId ||
        !update.term ||
        update.grade === undefined
      ) {
        throw new Error("Missing required fields in one or more updates");
      }

      return {
        updateOne: {
          filter: {
            SubjectId: update.SubjectId,
            StudentId: update.StudentId
          },
          update: {
            $set: {
              [`terms.${update.term}`]: update.grade, 
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

export const updateRemarks = async (req, res) => {
  try {
    const { selectedTerm, studentId, subjectId, remarks } = req.body;

    if (!studentId || !subjectId || !selectedTerm) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const db = getDB();
    const term = selectedTerm.toLowerCase(); // Ensure consistency
    const finalRemarks = remarks.trim(); // Trim whitespace

    // Update the remarks field dynamically
    const result = await db.collection("grades").updateOne(
      { StudentId: studentId, SubjectId: subjectId },
      { $set: { [term + "Remarks"]: finalRemarks } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Student record not found." });
    }

    return res.status(200).json({ success: true, message: "Remarks updated successfully." });
  } catch (error) {
    console.error("Error updating remarks:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};




