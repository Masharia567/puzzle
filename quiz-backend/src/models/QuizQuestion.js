export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const QuizQuestion = sequelize.define('QuizQuestion', {
    question_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'QUESTION_ID'
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
    question_text: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'QUESTION_TEXT'
    },
    question_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['multiple_choice', 'true_false', 'short_answer', 'open_ended']] // ✅ Added 'open_ended'
      },
      field: 'QUESTION_TYPE'
    },
    correct_answer: {
      type: DataTypes.STRING(500),
      allowNull: true, // ✅ Changed from false to true
      field: 'CORRECT_ANSWER'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      field: 'POINTS'
    },
    question_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'QUESTION_ORDER'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'CREATED_AT'
    }
  }, {
    tableName: 'QUIZ_QUESTIONS',
    timestamps: false,
    paranoid: false,
    underscored: false,
    // Explicitly disable deletedAt
    deletedAt: false
  });

  return QuizQuestion;
}