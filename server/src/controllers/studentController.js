import { Op } from 'sequelize';
import Student from '../models/Student.js';

export const addStudent = async (req, res) => {
    try {
        const { rollNumber, firstName, lastName, email, class: studentClass } = req.body;
        const adminId = req.admin.id;

        if (!rollNumber || !firstName || !lastName || !studentClass) {
             return res.status(400).json({ message: "Roll Number, First Name, Last Name, and Class are required" });
        }
        
        const existing = await Student.findOne({ where: { rollNumber, adminId } });
        if (existing) {
            return res.status(400).json({ message: "Student with this Roll Number already exists in your records" });
        }
        
        const student = await Student.create({
            rollNumber,
            firstName,
            lastName,
            email,
            class: studentClass,
            adminId
        });
        
        return res.status(201).json({ message: "Student added successfully", student });
    } catch (error) {
        console.error("Add student error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const editStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin.id;
        const { rollNumber, firstName, lastName, email, class: studentClass } = req.body;
        
        const student = await Student.findOne({ where: { id, adminId } });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        if (rollNumber && rollNumber !== student.rollNumber) {
            const existing = await Student.findOne({ where: { rollNumber, adminId } });
            if (existing) {
                return res.status(400).json({ message: "Student with this Roll Number already exists in your records" });
            }
            student.rollNumber = rollNumber;
        }
        
        if (firstName) student.firstName = firstName;
        if (lastName) student.lastName = lastName;
        if (email !== undefined) student.email = email;
        if (studentClass) student.class = studentClass;
        
        await student.save();
        return res.status(200).json({ message: "Student updated successfully", student });
    } catch (error) {
        console.error("Edit student error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin.id;
        const student = await Student.findOne({ where: { id, adminId } });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        await student.destroy();
        return res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Delete student error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getStudents = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const students = await Student.findAll({
            where: { adminId },
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json(students);
    } catch (error) {
        console.error("Get students error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const searchStudents = async (req, res) => {
    try {
        const { query } = req.query;
        const adminId = req.admin.id;
        if (!query) {
            const students = await Student.findAll({ where: { adminId }, order: [['createdAt', 'DESC']] });
            return res.status(200).json(students);
        }
        
        const students = await Student.findAll({
            where: {
                adminId,
                [Op.or]: [
                    { rollNumber: { [Op.like]: `%${query}%` } },
                    { firstName: { [Op.like]: `%${query}%` } },
                    { lastName: { [Op.like]: `%${query}%` } },
                    { class: { [Op.like]: `%${query}%` } }
                ]
            },
            order: [['createdAt', 'DESC']]
        });
        
        return res.status(200).json(students);
    } catch (error) {
        console.error("Search students error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
