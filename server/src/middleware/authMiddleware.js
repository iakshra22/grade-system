import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies?.token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

        if (!token) {
            return res.status(401).json({ message: "Authentication token missing or invalid" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

export default authMiddleware;
