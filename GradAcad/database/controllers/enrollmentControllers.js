import { getDB, getClient} from '../config/db.js';

export const insertOrUpdateEnrollment = async (req, res) => {

  const client = getClient(); // Get the MongoDB client
  const db = getDB();

    let {
      studentId,
      lastName,
      firstName,
      middleName,
      suffix,
      type,
      course,
      courseEnrolled,
      yearLevel,
      sectionEnrolled,
      subjectCode,
      schoolYear,
      sem,
      section
    } = req.body;
  
    
  
    // Normalize schoolYear format (add spaces around hyphen)
    const formattedSchoolYear = schoolYear.includes(' - ') 
      ? schoolYear 
      : schoolYear.replace('-', ' - ');
  
    // Normalize semester
    const semMap = {
      "1st": "First",
      "2nd": "Second",
      "first": "First",
      "second": "Second",
    };
    sem = semMap[sem.toLowerCase()] || sem;
  
    // Normalize year level
    const yearMap = {
      "1st": "1",
      "2nd": "2",
      "3rd": "3",
      "4th": "4",
      "first": "1",
      "second": "2",
      "third": "3",
      "fourth": "4",
    };
    yearLevel = yearMap[yearLevel.toLowerCase()] || yearLevel;

    const studentsCollection = db.collection("students");
    const gradesCollection = db.collection("grades");
    const subjectsCollection = db.collection("subjects");
    const enrollmentsCollection = db.collection("enrollment");

    try {
      // 1. Fetch subject to get yearLevelSubj
      const subject = await subjectsCollection.findOne({ 
        subjectCode: subjectCode 
      });
      
      if (!subject) {
        return res.status(404).json({ 
          success: false, 
          message: "Subject not found"
        });
      }

      const newYearLevelSubj = yearMap[subject.yearLevel] || yearLevel;

      const yearLevelSubj = newYearLevelSubj || yearLevel;
      const sectionToUse = sectionEnrolled || section || 'A';

      // 2. Prepare documents (using formattedSchoolYear)
      const studentDoc = {
        _id: studentId,
        LastName: lastName,
        FirstName: firstName,
        MiddleInitial: middleName,
        SectionId: `${course}-${yearLevel}${sectionToUse}`,
        StudentType: type,
        ...(suffix && { Suffix: suffix })
      };

      const enrollmentDoc = {
        acadYr: formattedSchoolYear,
        sem,
        subjectId: subjectCode,
        dept: courseEnrolled,
        profId: "",
        sect: `${yearLevelSubj}${sectionToUse}`,
      };

      // 3. Execute all updates
      const session = client.startSession();
      try {
        await session.withTransaction(async () => {
          // Update student
          await studentsCollection.updateOne(
            { _id: studentId },
            { $set: studentDoc },
            { upsert: true, session }
          );

          // Update grades (using formattedSchoolYear)
          await gradesCollection.updateOne(
            {
              StudentId: studentId,
              SubjectId: subjectCode,
              acadYr: formattedSchoolYear, // Using formatted version here
              sem: sem,
            },
            {
              $setOnInsert: {
                StudentId: studentId,
                SubjectId: subjectCode,
                acadYr: formattedSchoolYear, // Using formatted version here
                sem: sem,
                terms: {
                  PRELIM: 0,
                  MIDTERM: 0,
                  FINAL: 0,
                },
              },
            },
            { upsert: true, session }
          );

        
        // Enrollment update with enrollee array handling
            const enrollmentUpdateResult = await enrollmentsCollection.updateOne(
                {
                    acadYr: formattedSchoolYear,
                    sem,
                    subjectId: subjectCode,
                    dept: courseEnrolled,
                    sect: `${yearLevelSubj}${sectionToUse}`,
                },
                {
                    $set: enrollmentDoc,
                    $addToSet: { enrollee: studentId }
                },
                { upsert: true, session }
            );
        
            // Handle duplicate enrollment
            if (enrollmentUpdateResult.modifiedCount === 0 && 
                enrollmentUpdateResult.upsertedCount === 0) {
                const existingEnrollment = await enrollmentsCollection.findOne({
                    acadYr: formattedSchoolYear,
                    sem,
                    subjectId: subjectCode,
                    dept: courseEnrolled,
                    sect: `${yearLevelSubj}${sectionToUse}`,
                    enrollee: studentId
                }, { session });
        
                if (existingEnrollment) {
                    throw new Error("DUPLICATE_ENROLLMENT");
                }
            }
            });
        
            return res.status(200).json({ 
                success: true, 
                message: "Enrollment recorded successfully." 
            });
        } catch (err) {
            await session.abortTransaction();
            
            if (err.message === "DUPLICATE_ENROLLMENT") {
            return res.status(409).json({
                success: false,
                message: "Student is already enrolled in this subject/section"
            });
            }
        
            console.error("Enrollment Error:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Enrollment failed. Please try again.",
                error: err.message 
            });
        } finally {
            await session.endSession();
        }
    } catch (err) {
      console.error("Enrollment Error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Enrollment failed. Please try again.",
        error: err.message 
      });
    }
};