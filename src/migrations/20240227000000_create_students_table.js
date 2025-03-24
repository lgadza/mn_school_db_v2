'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        field: 'user_id',
      },
      schoolId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'schools',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        field: 'school_id',
      },
      gradeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'grades',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        field: 'grade_id',
      },
      classId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'classes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        field: 'class_id',
      },
      enrollmentDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        field: 'enrollment_date',
      },
      studentNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'student_number',
      },
      guardianInfo: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of guardian information',
        field: 'guardian_info',
      },
      healthInfo: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON object of health information',
        field: 'health_info',
      },
      previousSchool: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON object of previous school information',
        field: 'previous_school',
      },
      enrollmentNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'enrollment_notes',
      },
      academicRecords: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of academic records',
        field: 'academic_records',
      },
      attendanceRecords: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of attendance records',
        field: 'attendance_records',
      },
      disciplinaryRecords: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of disciplinary records',
        field: 'disciplinary_records',
      },
      specialNeeds: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON object of special needs information',
        field: 'special_needs',
      },
      extracurricularActivities: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of extracurricular activities',
        field: 'extracurricular_activities',
      },
      documents: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of document links/references',
        field: 'documents',
      },
      activeStatus: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'active_status',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at',
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at',
      },
    });

    // Add indexes
    await queryInterface.addIndex('students', ['user_id'], {
      name: 'student_user_id_idx',
    });
    await queryInterface.addIndex('students', ['school_id'], {
      name: 'student_school_id_idx',
    });
    await queryInterface.addIndex('students', ['grade_id'], {
      name: 'student_grade_id_idx',
    });
    await queryInterface.addIndex('students', ['class_id'], {
      name: 'student_class_id_idx',
    });
    await queryInterface.addIndex('students', ['student_number'], {
      name: 'student_number_idx',
      unique: true,
    });
    await queryInterface.addIndex('students', ['active_status'], {
      name: 'student_status_idx',
    });
    await queryInterface.addIndex('students', ['enrollment_date'], {
      name: 'student_enrollment_date_idx',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('students');
  }
};
