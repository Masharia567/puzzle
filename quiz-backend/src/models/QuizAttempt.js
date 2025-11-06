export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const QuizAttempt = sequelize.define('QuizAttempt', {
    attempt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: true,
      autoIncrement: true,
      field: 'ATTEMPT_ID'
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'QUIZ_ID',
      references: {
        model: 'QUIZZES',
        key: 'QUIZ_ID'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID',
      references: {
        model: 'USERS',
        key: 'USER_ID'
      }
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'SCORE'
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TOTAL_POINTS'
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'PERCENTAGE'
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'in_progress',
      field: 'STATUS'
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'STARTED_AT'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'COMPLETED_AT'
    },
    time_taken: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TIME_TAKEN'
    }
  }, {
    tableName: 'QUIZ_ATTEMPTS',
    timestamps: false,
    underscored: false, // ← CHANGED FROM true TO false
    freezeTableName: true
  });

  return QuizAttempt;
}