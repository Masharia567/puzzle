export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  
  const UserAnswer = sequelize.define('UserAnswer', {
    answer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ANSWER_ID'
    },
    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ATTEMPT_ID',
      references: {
        model: 'QUIZ_ATTEMPTS',
        key: 'ATTEMPT_ID'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'QUESTION_ID',
      references: {
        model: 'QUIZ_QUESTIONS',
        key: 'QUESTION_ID'
      }
    },
    user_answer: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'USER_ANSWER'
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'IS_CORRECT'
    },
    points_earned: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'POINTS_EARNED'
    },
    answered_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'ANSWERED_AT'
    }
  }, {
    tableName: 'USER_ANSWERS',
    timestamps: false,
    underscored: false,  // ← CHANGED FROM true TO false
    freezeTableName: true
  });

  return UserAnswer;
}