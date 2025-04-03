import { getDB } from '../../db.js';
import { ObjectId } from "mongodb";

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
    const data = await db.collection("global")
      .find(
        { _id: new ObjectId("67a8272664a1bcf184a3637c") }, // Filter for specific _id
        {
          projection: {
            currentAcadYr: 1,
            currentSem: 1,
            currentTerm: 1,
            _id: 0, 
            isDonePrelim: 1,
            isDoneMidterm: 1,
            isDoneFinal: 1,
          },
        }
      )
      .toArray();

    const formattedData = data.map((doc) => ({
      acadYr: doc.currentAcadYr,
      sem: doc.currentSem[0],
      term: doc.currentTerm[0],
      prelimDone: doc.isDonePrelim,
      midtermDone: doc.isDoneMidterm,
      finalDone: doc.isDoneFinal,
    }));

    res.json({ success: true, data: formattedData });
  } catch (err) {
    console.error("Error fetching terms:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
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

export const generateReportForRegistrar = async (req, res) => {
  try {
    const db = getDB();

    // 🔍 Step 1: Query enrollment collection and join with subjects collection
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

    if (!enrollmentDocs.length) {
      return res.status(404).json({ success: false, message: "No records found." });
    }

    res.status(200).json({ success: true, data: enrollmentDocs });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

export const enlistmentReport = async (req, res) => {
  const { acadYr, sem, subjCode, dept, sect } = req.body;

  try {
    const db = getDB();

    // 🔍 Step 1: Query enrollment collection based on request body
    const enrollmentDocs = await db.collection("enrollment")
      .find({ acadYr, sem, subjectId: subjCode, dept, sect })
      .project({ _id: 0 }) // Exclude _id
      .toArray();

    if (!enrollmentDocs.length) {
      return res.status(404).json({ success: false, message: "No records found." });
    }

    // 🔍 Step 2: Fetch instructor details from users collection
    const profId = enrollmentDocs[0]?.profId;
    const instructor = await db.collection("users").findOne(
      { refId: profId },
      { projection: { _id: 0, name: 1 } } // Only fetch name
    );

    // 🔍 Step 3: Fetch student details from students collection
    const studentIds = enrollmentDocs.flatMap(doc => doc.enrollee);
    const students = await db.collection("students")
      .find({ _id: { $in: studentIds } })
      .project({ _id: 1, LastName: 1, FirstName: 1, MiddleInitial: 1, SectionId: 1 })
      .toArray();

    // 📝 Step 4: Construct response
    const responseData = enrollmentDocs.map(doc => ({
      acadYr: doc.acadYr,
      sem: doc.sem,
      subjectId: doc.subjectId,
      dept: doc.dept,
      sect: doc.sect,
      instructor: instructor?.name || "Unknown",
      students: students
    }));

    res.status(200).json({ success: true, data: responseData });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
};

export const revisionRequest = async (req, res) => {

  const { profId } = req.body

  try {
    const db = getDB();

    // 🔍 Step 1: Query enrollment collection and join with subjects collection
    const enrollmentDocs = await db.collection("enrollment").find({profId: profId}, { projection: { _id: 0, enrollee: 0, profId: 0 } }).toArray();

    if (!enrollmentDocs.length) {
      return res.status(404).json({ success: false, message: "No records found." });
    }

    res.status(200).json({ success: true, data: enrollmentDocs });

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

export const updateGradingPeriodNewAcadYr = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("global"); 

    const { 
      acadYr, 
      sem, 
      term, 
      prelimDone, 
      midtermDone, 
      finalDone,
      startAt,  
      endAt,
      setSem,
      setTerm,
      startDate,
      endDate,
      startTime,
      endTime,    
    } = req.body;

    const update = {
      currentAcadYr: acadYr,
      currentSem: [sem],
      currentTerm: [term],
      isDonePrelim: prelimDone,
      isDoneMidterm: midtermDone,
      isDoneFinal: finalDone,
      "scheduling": {
        isPending: true,
        isActive: false, 
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
        lastCronCheck: null
      },
      startDate,
      endDate,
      setSem,
      setTerm,
      startTime,
      endTime
    };

    const result = await collection.updateOne({}, { $set: update });

    if (result.modifiedCount > 0) {
      return res.status(200).json({ success: true, message: "Grading period updated successfully", nextAction: `Will auto-activate at ${startAt}`});
    } else {
      return res.status(400).json({ success: false, message: "No changes made to the document" });
    }
  } catch (error) {
    console.error("Error updating grading period:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateGradingPeriodChangeTerm = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("global"); 
    const { 
      term, 
      startAt, 
      endAt,
      setSem,
      setTerm,
      startDate,
      endDate,
      startTime,
      endTime, 
    } = req.body;

    // Update the document
    const result = await collection.updateOne(
      {},
      {
        $set: {
          currentTerm: [term],
          "scheduling": {
            isPending: true,
            isActive: false,
            startAt: startAt ? new Date(startAt) : null,
            endAt: endAt ? new Date(endAt) : null,
            lastCronCheck: null
          },
          startDate,
          endDate,
          setSem,
          setTerm,
          startTime,
          endTime,
        },
      }
    );

    if (result.modifiedCount > 0) {
      return res.status(200).json({ success: true, message: "Grading period updated successfully", data:{term} });
    } else {
      return res.status(400).json({ success: false, message: "No changes made to the document" });
    }
  } catch (error) {
    console.error("Error updating grading period:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateGradingPeriodChangeSem = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("global"); 

    const { 
      sem, 
      term, 
      prelimDone, 
      midtermDone, 
      finalDone,
      startAt,  
      endAt,
      setSem,
      setTerm,
      startDate,
      endDate,
      startTime,
      endTime,
    } = req.body;

    const update = {
      currentSem: [sem],
      currentTerm: [term],
      isDonePrelim: prelimDone,
      isDoneMidterm: midtermDone,
      isDoneFinal: finalDone,
      "scheduling": {
        isPending: true,
        isActive: false, // Will activate via cron
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
        lastCronCheck: null
      },
      setSem,
      setTerm,
      startDate,
      endDate,
      startTime,
      endTime,
    };

    // Update the document
    const result = await collection.updateOne({},{ $set: update });

    if (result.modifiedCount > 0) {
      return res.status(200).json({ success: true, message: "Grading period updated successfully", data: {term} });
    } else {
      return res.status(400).json({ success: false, message: "No changes made to the document" });
    }
  } catch (error) {
    console.error("Error updating grading period:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateGradingPeriodTermDone = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("global");
    const { prelimDone, midtermDone, finalDone} = req.body;

    let updateFields = {};

    
    if (finalDone) {
      updateFields.isDoneFinal = true;
    } 
   
    else if (midtermDone) {
      updateFields.isDoneMidterm = true;
    } 
   
    else if (prelimDone) {
      updateFields.isDonePrelim = true;
      updateFields.isDoneMidterm = false;
      updateFields.isDoneFinal = false;
    }

    // If there's nothing to update, return
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, message: "No updates made." });
    }

    // Perform the update with a 10-second delay
    setTimeout(async () => {
      const result = await collection.updateOne({}, { $set: updateFields });

      if (result.modifiedCount > 0) {
        res.status(200).json({ success: true, message: "Grading period updated successfully" });
      } else {
        res.status(400).json({ success: false, message: "No changes made to the document" });
      }
    }, 10000); // 10-second delay

  } catch (error) {
    console.error("Error updating grading period:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const pendingGradingPeriod = async (req, res) => {
  const db = getDB();

  try {
    // Fetch the document from the 'global' collection
    const data = await db.collection("global").findOne(
      {}, // Assuming there's only one global document
      { projection: { "scheduling.isPending": 1, _id: 0 } }
    );

    if (!data) {
      return res.status(404).json({ success: false, message: "No grading period found." });
    }

    res.json({
      success: true,
      isPending: data.scheduling?.isPending ?? false, // Return isActive or false if undefined
    });
  } catch (error) {
    console.error("Error fetching active grading period:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getGradingPeriod = async (req, res) => {
  const db = getDB();

  try {
    // Fetch the document from the 'global' collection
    const data = await db.collection("global").findOne(
      {}, // Assuming there's only one global document
      { projection: { currentAcadYr: 1, setSem: 1, setTerm: 1, startDate: 1, endDate: 1 ,startTime: 1, endTime: 1, _id: 0 } }
    );

    if (!data) {
      return res.status(404).json({ success: false, message: "No grading period found." });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Error fetching active grading period:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const setRequest = async (req, res) => {
  const db = getDB();

  try {
    // Extract data from request body
    const { refId, name, subjectId, acadYr, sem, dept, sect, term } = req.body;

    // Validate required fields
    if (!refId || !subjectId || !acadYr || !sem || !term) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

      // Check if a request with the same values already exists
    const existingRequest = await db.collection("global").findOne(
      {
        refId,
        name,
        subjectId,
        acadYr,
        sem,
        dept,
        sect,
        term,
      },
      { projection: { isActive: 1 } } // Proper way to project only the isActive field
    );

    // Check if a matching request exists and if isActive is true
    if (existingRequest && existingRequest.isActive === true) {
      return res
        .status(409)
        .json({ success: false, message: "A request with the same details is already active." });
    }


    // Create new request document
    const newRequest = {
      requestId: Math.random().toString(36).substr(2, 6).toUpperCase(), 
      refId,
      name,
      subjectId,
      acadYr,
      sem,
      dept,
      sect,
      term,
      createdAt: new Date(),
      isActive: true, // Timestamp for tracking
    };

    // Insert into the 'global' collection
    const result = await db.collection("global").insertOne(newRequest);

    if (result.acknowledged) {
      res.status(201).json({ success: true, message: "Request successfully created."});
    } else {
      res.status(500).json({ success: false, message: "Failed to insert request." });
    }
  } catch (error) {
    console.error("Error inserting request:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const fetchAllRequest = async (req, res) => {
  try {
    const db = getDB();
    const globalCollection = db.collection("global");

    // Fetch all requests excluding `_id` and `createdAt`, and skipping a specific `_id`
    const requests = await globalCollection
      .find({ _id: { $ne: new ObjectId("67a8272664a1bcf184a3637c") } }) // Exclude specific document
      .project({ _id: 0, createdAt: 0 }) // Exclude fields
      .toArray();

    if (requests.length > 0) {
      res.status(200).json({ success: true, data: requests });
    } else {
      res.status(404).json({ success: false, message: "No requests found." });
    }
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const fetchAllRequestById = async (req, res) => {
  const { refId } = req.body

  try {
    const db = getDB();
    const globalCollection = db.collection("global");

    // Fetch all requests excluding `_id` and `createdAt`, and skipping a specific `_id`
    const requests = await globalCollection
      .find({ _id: { $ne: new ObjectId("67a8272664a1bcf184a3637c") }, refId: refId }) // Exclude specific document
      .project({ _id: 0, createdAt: 0, name: 0, requestId: 0, createdAt: 0 }) // Exclude fields
      .toArray();

    if (requests.length > 0) {
      res.status(200).json({ success: true, data: requests });
    } else {
      res.status(404).json({ success: false, message: "No requests found." });
    }
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const closeRequest = async (req, res) => {
  const db = getDB();

  try {
    const { requestId } = req.body;

    if (!requestId) {
      return res.status(400).json({ success: false, message: "Missing requestId." });
    }

    // Update document where requestId matches
    const result = await db.collection("global").updateOne(
      { requestId: requestId },
      { $set: { isActive: false } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    res.status(200).json({ success: true, message: "Request successfully closed." });
  } catch (error) {
    console.error("Error closing request:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
