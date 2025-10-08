export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  
  const QuizQuestionOption = sequelize.define('QuizQuestionOption', {
    option_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'OPTION_ID'
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
    option_text: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'OPTION_TEXT'
    },
    optional_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'OPTION_ORDER'
    }
  }, {
    tableName: 'QUIZ_QUESTION_OPTIONS',
    timestamps: false,
    underscored: true
  });

  return QuizQuestionOption;
}