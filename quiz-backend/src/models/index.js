// src/models/index.js
import db from '../config/database.js';
import Sequelize from 'sequelize';

// Quiz models
import QuizModel from './quiz.js';
import QuizQuestionModel from './QuizQuestion.js';
import QuizQuestionOptionModel from './QuizQuestionOption.js';
import QuizAttemptModel from './QuizAttempt.js';
import UserAnswerModel from './UserAnswer.js';

// Puzzle models
import PuzzleModel from './Puzzle.js';
import PuzzleCompletionModel from './PuzzleCompletion.js';
import WordLegendPuzzleModel from './WordLegendPuzzle.js';
import WordLegendUserProgressModel from './WordLegendUserProgress.js';
import WordLegendSubmissionModel from './WordLegendSubmission.js';

// Other models
import UserModel from './user.js';
import LeaderboardModel from './Leaderboard.js';
import StoryModel from './Story.js';
import StoryMediaModel from './StoryMedia.js';
import CommentModel from './Comment.js';
import LeagueModel from './League.js';
import LeagueMemberModel from './LeagueMember.js';
import LeagueGameModel from './LeagueGame.js';
import LeagueGameParticipantModel from './LeagueGameParticipant.js';

// ✨ CLEAN UP WORD SEARCH IMPORTS - REMOVE DUPLICATES
import WordSearchModel from './WordSearch.js';
import WordSearchCompletionModel from './WordSearchCompletion.js';

import opencircleQuizModel from './opencircleQuiz.js';
import opencircleCommentModel from './opencircleComment.js';

let models = null;

export async function initializeModels() {
  if (models) return models; // Return cached models

  const sequelize = await db.initialize();

  // Initialize models
  const Puzzle = PuzzleModel(sequelize);
  const PuzzleCompletion = PuzzleCompletionModel(sequelize);

  const Quiz = QuizModel(sequelize);
  const QuizQuestion = QuizQuestionModel(sequelize);
  const QuizQuestionOption = QuizQuestionOptionModel(sequelize);
  const QuizAttempt = QuizAttemptModel(sequelize);
  const UserAnswer = UserAnswerModel(sequelize);

  const User = UserModel(sequelize);
  const Leaderboard = LeaderboardModel(sequelize);

  const WordLegendPuzzle = WordLegendPuzzleModel(sequelize);
  const WordLegendUserProgress = WordLegendUserProgressModel(sequelize);
  const WordLegendSubmission = WordLegendSubmissionModel(sequelize);
  const Story = StoryModel(sequelize);
  const StoryMedia = StoryMediaModel(sequelize);
  const Comment = CommentModel(sequelize);
  const League = LeagueModel(sequelize);
  const LeagueMember = LeagueMemberModel(sequelize);
  const LeagueGame = LeagueGameModel(sequelize);
  const LeagueGameParticipant = LeagueGameParticipantModel(sequelize);
  
  // ✨ INITIALIZE WORD SEARCH MODELS CORRECTLY
  const WordSearch = WordSearchModel(sequelize);
  const WordSearchCompletion = WordSearchCompletionModel(sequelize);
  
  const opencircleQuiz = opencircleQuizModel(sequelize);
  const opencircleComment = opencircleCommentModel(sequelize);

  // ==================== Associations ====================

  // Quiz associations
  Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id', as: 'questions', onDelete: 'CASCADE' });
  QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

  QuizQuestion.hasMany(QuizQuestionOption, { foreignKey: 'question_id', as: 'options', onDelete: 'CASCADE' });
  QuizQuestionOption.belongsTo(QuizQuestion, { foreignKey: 'question_id', as: 'question' });

  Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id', as: 'attempts' });
  QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

  QuizAttempt.hasMany(UserAnswer, { foreignKey: 'ATTEMPT_ID', as: 'answers', onDelete: 'CASCADE' });
  UserAnswer.belongsTo(QuizAttempt, { foreignKey: 'ATTEMPT_ID', as: 'attempt' })

  QuizQuestion.hasMany(UserAnswer, { foreignKey: 'QUESTION_ID', as: 'userAnswers' });
  UserAnswer.belongsTo(QuizQuestion, { foreignKey: 'QUESTION_ID', as: 'question' });

  // Puzzle associations
  Puzzle.hasMany(PuzzleCompletion, { foreignKey: 'PUZZLE_ID', as: 'completions' });
  PuzzleCompletion.belongsTo(Puzzle, { foreignKey: 'PUZZLE_ID', as: 'puzzle' });

  // ✨ Word Search associations
  WordSearch.hasMany(WordSearchCompletion, { 
    foreignKey: 'puzzle_id', 
    as: 'completions',
    onDelete: 'CASCADE' 
  });
  WordSearchCompletion.belongsTo(WordSearch, { 
    foreignKey: 'puzzle_id', 
    as: 'puzzle' 
  });

  // Leaderboard associations
  Leaderboard.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasMany(Leaderboard, { foreignKey: 'user_id', as: 'leaderboards' });

  Leaderboard.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });
  Quiz.hasMany(Leaderboard, { foreignKey: 'quiz_id', as: 'leaderboards' });

  // WordLegend associations
  WordLegendUserProgress.belongsTo(WordLegendPuzzle, { foreignKey: 'PUZZLE_ID', as: 'puzzle' });
  WordLegendUserProgress.belongsTo(User, { foreignKey: 'USER_ID', as: 'user' });

  WordLegendSubmission.belongsTo(WordLegendPuzzle, { foreignKey: 'PUZZLE_ID', as: 'puzzle' });
  WordLegendSubmission.belongsTo(User, { foreignKey: 'USER_ID', as: 'user' });
  
// ==================== League Associations ====================

// League belongs to a User (creator)
League.belongsTo(User, { 
  foreignKey: 'creatorId',      // JavaScript property (maps to CREATOR_ID in DB)
  as: 'creator', 
  targetKey: 'MICROSOFT_ID'     // ✅ Correct - references MICROSOFT_ID in User table
});

// League has many LeagueMember records
League.hasMany(LeagueMember, { 
  foreignKey: 'league_id',      // ✅ Use snake_case to match LeagueMember model
  sourceKey: 'id',              // ✅ Add this - League's primary key
  as: 'memberships' 
});

// League belongs to many Users through LeagueMember
League.belongsToMany(User, {
  through: LeagueMember,
  foreignKey: 'league_id',      // ✅ snake_case to match LeagueMember model
  otherKey: 'userId',           // ✅ camelCase to match LeagueMember model
  as: 'members',
  sourceKey: 'id',              // ✅ League's primary key
  targetKey: 'MICROSOFT_ID'     // ✅ User's key to match against
});

// User side - User belongs to many Leagues through LeagueMember
User.belongsToMany(League, {
  through: LeagueMember,
  foreignKey: 'userId',         // ✅ camelCase to match LeagueMember model
  otherKey: 'league_id',        // ✅ snake_case to match LeagueMember model
  as: 'leagues',
  sourceKey: 'MICROSOFT_ID',    // ✅ User's key (not ID)
  targetKey: 'id'               // ✅ League's primary key
});

// LeagueMember belongs to User
LeagueMember.belongsTo(User, { 
  foreignKey: 'userId',         // ✅ camelCase to match LeagueMember model definition
  as: 'user',                   // ✅ Changed from 'user' for consistency (lowercase)
  targetKey: 'MICROSOFT_ID'     // ✅ Correct - User's key
});

// LeagueMember belongs to League
LeagueMember.belongsTo(League, { 
  foreignKey: 'league_id',      // ✅ snake_case to match LeagueMember model
  as: 'league',
  targetKey: 'id'               // ✅ Add this - League's primary key
});

  //story associations
  Story.hasMany(Comment, { foreignKey: 'STORY_ID', as: 'comments' });
  Comment.belongsTo(Story, { foreignKey: 'STORY_ID', as: 'story' });
  Comment.belongsTo(User, { foreignKey: 'USER_ID', as: 'user' });
  Comment.hasMany(Comment, { foreignKey: 'PARENT_COMMENT_ID', as: 'replies' });
  
  // ==================== Cache models ====================
  models = {
    sequelize,
    Puzzle,
    PuzzleCompletion,
    Quiz,
    QuizQuestion,
    QuizQuestionOption,
    QuizAttempt,
    UserAnswer,
    User,
    Leaderboard,
    WordLegendPuzzle,
    WordLegendUserProgress,
    WordLegendSubmission,
    Story,
    StoryMedia,
    Comment,
    League,
    LeagueMember,
    LeagueGame,
    LeagueGameParticipant,
    WordSearch,              // ✨ ADD THIS
    WordSearchCompletion,    // ✨ KEEP THIS
    WordSearchModel: WordSearch,  // ✨ ADD ALIAS FOR COMPATIBILITY
    opencircleQuiz,
    opencircleComment,
  };

  return models;
}