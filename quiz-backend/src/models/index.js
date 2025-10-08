import db from '../config/database.js';
import QuizModel from './quiz.js';
import QuizQuestionModel from './QuizQuestion.js';
import QuizQuestionOptionModel from './QuizQuestionOption.js';
import QuizAttemptModel from './QuizAttempt.js';
import UserAnswerModel from './UserAnswer.js';

let models = null;

export async function initializeModels() {
  if (models) return models;

  const sequelize = await db.initialize();

  // Initialize models
  const Quiz = QuizModel(sequelize);
  const QuizQuestion = QuizQuestionModel(sequelize);
  const QuizQuestionOption = QuizQuestionOptionModel(sequelize);
  const QuizAttempt = QuizAttemptModel(sequelize);
  const UserAnswer = UserAnswerModel(sequelize);

  // Define associations
  Quiz.hasMany(QuizQuestion, {
    foreignKey: 'quiz_id',
    as: 'questions',
    onDelete: 'CASCADE'
  });
  QuizQuestion.belongsTo(Quiz, {
    foreignKey: 'quiz_id',
    as: 'quiz'
  });

  QuizQuestion.hasMany(QuizQuestionOption, {
    foreignKey: 'question_id',
    as: 'options',
    onDelete: 'CASCADE'
  });
  QuizQuestionOption.belongsTo(QuizQuestion, {
    foreignKey: 'question_id',
    as: 'question'
  });

  Quiz.hasMany(QuizAttempt, {
    foreignKey: 'quiz_id',
    as: 'attempts'
  });
  QuizAttempt.belongsTo(Quiz, {
    foreignKey: 'quiz_id',
    as: 'quiz'
  });

  QuizAttempt.hasMany(UserAnswer, {
    foreignKey: 'attempt_id',
    as: 'answers',
    onDelete: 'CASCADE'
  });
  UserAnswer.belongsTo(QuizAttempt, {
    foreignKey: 'attempt_id',
    as: 'attempt'
  });

  QuizQuestion.hasMany(UserAnswer, {
    foreignKey: 'question_id',
    as: 'userAnswers'
  });
  UserAnswer.belongsTo(QuizQuestion, {
    foreignKey: 'question_id',
    as: 'question'
  });

  models = {
    Quiz,
    QuizQuestion,
    QuizQuestionOption,
    QuizAttempt,
    UserAnswer,
    sequelize
  };

  return models;
}

export default models;