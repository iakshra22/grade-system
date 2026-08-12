import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Admin from './Admin.js';

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
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

Admin.hasMany(Subject, { foreignKey: 'adminId', onDelete: 'CASCADE' });
Subject.belongsTo(Admin, { foreignKey: 'adminId' });

export default Subject;
