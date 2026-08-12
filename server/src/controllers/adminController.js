import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        const admin = await Admin.findOne({ where: { username } });
        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET || 'supersecretkey123',
            { expiresIn: '1d' }
        );
        
        return res.status(200).json({
            message: "Login successful",
            token,
            admin: { id: admin.id, username: admin.username }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin.id;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new passwords are required" });
        }
        
        const admin = await Admin.findByPk(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        admin.password = hashedPassword;
        await admin.save();
        
        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        
        const existing = await Admin.findOne({ where: { username } });
        if (existing) {
            return res.status(400).json({ message: "Username already exists" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const admin = await Admin.create({
            username,
            password: hashedPassword
        });
        
        return res.status(201).json({
            message: "Teacher registered successfully",
            admin: { id: admin.id, username: admin.username }
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Seed function to create initial admin if database is empty
export const seedAdmin = async () => {
    try {
        const count = await Admin.count();
        if (count === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            await Admin.create({
                username: 'admin',
                password: hashedPassword
            });
            console.log('Default teacher seeded successfully! (Username: admin, Password: admin123)');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};
