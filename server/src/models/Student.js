import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Admin from './Admin.js';

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rollNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    class: {
        type: DataTypes.STRING,
        allowNull: false
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Admin,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
});

Admin.hasMany(Student, { foreignKey: 'adminId', onDelete: 'CASCADE' });
Student.belongsTo(Admin, { foreignKey: 'adminId' });

export default Student;
