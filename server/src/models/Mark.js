import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Student from './Student.js';
import Subject from './Subject.js';

const Mark = sequelize.define('Mark', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Student,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Subject,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    marksObtained: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    maxMarks: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100
    }
});

// Establish model associations
Student.hasMany(Mark, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Mark.belongsTo(Student, { foreignKey: 'studentId' });

Subject.hasMany(Mark, { foreignKey: 'subjectId', onDelete: 'CASCADE' });
Mark.belongsTo(Subject, { foreignKey: 'subjectId' });

export default Mark;
