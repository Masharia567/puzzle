export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  
  const QuizAttempt = sequelize.define('QuizAttempt', {
    attempt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
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
      field: 'USER_ID'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'SCORE'
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TOTAL_POINTS'
    },
    time_taken: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time taken in seconds',
      field: 'TIME_TAKEN'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'COMPLETED_AT'
    }
  }, {
    tableName: 'QUIZ_ATTEMPTS',
    timestamps: false,
    underscored: true
  });

  return QuizAttempt;
}