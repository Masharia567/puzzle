// src/models/Leaderboard.js
export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const Leaderboard = sequelize.define('Leaderboard', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID'
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow NULL if it's a puzzle entry instead of a quiz
      field: 'QUIZ_ID'
    },
    puzzle_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'PUZZLE_ID'
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'SCORE'
    },
    time_taken_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'TIME_TAKEN_SECONDS'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CREATED_AT'
    }
  }, {
    tableName: 'LEADERBOARD',
    timestamps: false
  });

  // 🔗 Associations — optional but helpful when joining with User, Quiz, and Puzzle models
  Leaderboard.associate = (models) => {
    Leaderboard.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Leaderboard.belongsTo(models.Quiz, {
      foreignKey: 'quiz_id',
      as: 'quiz'
    });
    Leaderboard.belongsTo(models.Puzzle, {
      foreignKey: 'puzzle_id',
      as: 'puzzle'
    });
  };

  return Leaderboard;
}
