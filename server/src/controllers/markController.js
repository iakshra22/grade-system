import Mark from '../models/Mark.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';

// Helper function to calculate total, percentage, grade, and pass/fail status
export const calculateReportCard = (marksList) => {
    if (!marksList || marksList.length === 0) {
        return {
            totalMarks: 0,
            maxMarks: 0,
            percentage: 0,
            grade: 'N/A',
            status: 'N/A'
        };
    }
    
    let totalMarks = 0;
    let maxMarks = 0;
    let hasFailedSubject = false;
    
    marksList.forEach(m => {
        totalMarks += m.marksObtained;
        maxMarks += m.maxMarks || 100;
        if (m.marksObtained < 40) {
            hasFailedSubject = true;
        }
    });
    
    const percentage = parseFloat(((totalMarks / maxMarks) * 100).toFixed(2));
    
    let status = 'Pass';
    let grade = 'F';
    
    if (hasFailedSubject || percentage < 40) {
        status = 'Fail';
        grade = 'F';
    } else {
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        else grade = 'E';
    }
    
    return {
        totalMarks,
        maxMarks,
        percentage,
        grade,
        status
    };
};

export const assignMark = async (req, res) => {
    try {
        const { studentId, subjectId, marksObtained } = req.body;
        const adminId = req.admin.id;

        if (studentId === undefined || subjectId === undefined || marksObtained === undefined) {
            return res.status(400).json({ message: "studentId, subjectId, and marksObtained are required" });
        }
        
        const marks = parseInt(marksObtained, 10);
        if (isNaN(marks) || marks < 0 || marks > 100) {
            return res.status(400).json({ message: "Marks obtained must be a number between 0 and 100" });
        }
        
        // Verify student and subject exist and belong to this admin
        const student = await Student.findOne({ where: { id: studentId, adminId } });
        if (!student) {
            return res.status(404).json({ message: "Student not found in your records" });
        }
        const subject = await Subject.findOne({ where: { id: subjectId, adminId } });
        if (!subject) {
            return res.status(404).json({ message: "Subject not found in your records" });
        }
        
        // Find or create mark
        let markRecord = await Mark.findOne({ where: { studentId, subjectId } });
        if (markRecord) {
            markRecord.marksObtained = marks;
            await markRecord.save();
        } else {
            markRecord = await Mark.create({
                studentId,
                subjectId,
                marksObtained: marks,
                maxMarks: 100
            });
        }
        
        return res.status(200).json({ message: "Marks assigned successfully", mark: markRecord });
    } catch (error) {
        console.error("Assign mark error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getStudentReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const adminId = req.admin.id;

        const student = await Student.findOne({ where: { id: studentId, adminId } });
        if (!student) {
            return res.status(404).json({ message: "Student not found in your records" });
        }
        
        const marks = await Mark.findAll({
            where: { studentId },
            include: [{ model: Subject, attributes: ['code', 'name'] }]
        });
        
        const summary = calculateReportCard(marks);
        
        return res.status(200).json({
            student,
            marks,
            summary
        });
    } catch (error) {
        console.error("Get student report error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllStudentReports = async (req, res) => {
    try {
        const adminId = req.admin.id;

        const students = await Student.findAll({
            where: { adminId },
            include: [{
                model: Mark,
                include: [{ model: Subject, attributes: ['code', 'name'] }]
            }]
        });
        
        const reports = students.map(student => {
            const summary = calculateReportCard(student.Marks || []);
            return {
                id: student.id,
                rollNumber: student.rollNumber,
                firstName: student.firstName,
                lastName: student.lastName,
                class: student.class,
                email: student.email,
                subjectsCount: (student.Marks || []).length,
                summary
            };
        });
        
        return res.status(200).json(reports);
    } catch (error) {
        console.error("Get all student reports error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
