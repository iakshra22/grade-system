import Subject from '../models/Subject.js';

export const addSubject = async (req, res) => {
    try {
        const { code, name } = req.body;
        const adminId = req.admin.id;

        if (!code || !name) {
            return res.status(400).json({ message: "Subject Code and Name are required" });
        }
        
        // standardizing the code to uppercase
        const upperCode = code.trim().toUpperCase();
        
        const existing = await Subject.findOne({ where: { code: upperCode, adminId } });
        if (existing) {
            return res.status(400).json({ message: "Subject with this code already exists in your records" });
        }
        
        const subject = await Subject.create({ code: upperCode, name: name.trim(), adminId });
        return res.status(201).json({ message: "Subject added successfully", subject });
    } catch (error) {
        console.error("Add subject error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSubjects = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const subjects = await Subject.findAll({ where: { adminId }, order: [['code', 'ASC']] });
        return res.status(200).json(subjects);
    } catch (error) {
        console.error("Get subjects error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin.id;
        const subject = await Subject.findOne({ where: { id, adminId } });
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        
        await subject.destroy();
        return res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        console.error("Delete subject error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
