// models/WordLegendPuzzle.js

export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const WordLegendPuzzle = sequelize.define(
    "WordLegendPuzzle",
    {
      PUZZLE_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: "PUZZLE_ID",
      },
      CATEGORY: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "CATEGORY",
      },
      DIFFICULTY: {
        type: DataTypes.ENUM("easy", "medium", "hard"),
        allowNull: false,
        field: "DIFFICULTY",
      },
      GRID_SIZE: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 3,
          max: 6,
        },
        field: "GRID_SIZE",
      },
      GRID_DATA: {
        type: DataTypes.TEXT, // JSON string
        allowNull: false,
        field: "GRID_DATA",
      },
      POSSIBLE_WORDS: {
        type: DataTypes.TEXT, // JSON string
        allowNull: false,
        field: "POSSIBLE_WORDS",
      },
      TOTAL_WORDS: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "TOTAL_WORDS",
      },
      CREATED_BY: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "CREATED_BY",
      },
      IS_ACTIVE: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "IS_ACTIVE",
      },
      PLAYS_COUNT: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "PLAYS_COUNT",
      },
      AVG_COMPLETION_TIME: {
        type: DataTypes.FLOAT,
        allowNull: true,
        field: "AVG_COMPLETION_TIME",
      },
      CREATED_AT: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "CREATED_AT",
      },
      UPDATED_AT: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "UPDATED_AT",
      },
    },
    {
      tableName: "WORDLEGEND_PUZZLES",
      timestamps: true,
      underscored: true,
      createdAt: "CREATED_AT",
      updatedAt: "UPDATED_AT",
      indexes: [
        { fields: ["CATEGORY"] },
        { fields: ["DIFFICULTY"] },
        { fields: ["IS_ACTIVE"] },
        { fields: ["CREATED_BY"] },
      ],
    }
  );

  // Instance method to increment plays count
  WordLegendPuzzle.prototype.incrementPlays = async function () {
    this.PLAYS_COUNT += 1;
    await this.save();
    return this.PLAYS_COUNT;
  };

  // Class method: Get active puzzles
  WordLegendPuzzle.getActivePuzzles = async function (filters = {}) {
    const where = { IS_ACTIVE: true, ...filters };
    return await this.findAll({ where });
  };

  // Class method: Get puzzles by difficulty
  WordLegendPuzzle.getByDifficulty = async function (difficulty) {
    return await this.findAll({
      where: {
        DIFFICULTY: difficulty,
        IS_ACTIVE: true,
      },
    });
  };

  // Associations
  WordLegendPuzzle.associate = function (models) {
    // Association with User (creator)
    if (models.User) {
      WordLegendPuzzle.belongsTo(models.User, {
        foreignKey: 'CREATED_BY',
        as: 'creator',
      });
    }

    // Association with UserProgress
    if (models.WordLegendUserProgress) {
      WordLegendPuzzle.hasMany(models.WordLegendUserProgress, {
        foreignKey: 'PUZZLE_ID',
        as: 'userProgress',
      });
    }

    // Association with Submissions
    if (models.WordLegendSubmission) {
      WordLegendPuzzle.hasMany(models.WordLegendSubmission, {
        foreignKey: 'PUZZLE_ID',
        as: 'submissions',
      });
    }
  };

  return WordLegendPuzzle;
}