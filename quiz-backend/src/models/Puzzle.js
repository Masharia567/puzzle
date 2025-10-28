// models/Puzzle.js
export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  
  const Puzzle = sequelize.define('Puzzle', {
    PUZZLE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'PUZZLE_ID'
    },
    TITLE: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'TITLE',
      validate: {
        notEmpty: {
          msg: 'Title cannot be empty'
        }
      }
    },
    TYPE: {
      type: DataTypes.ENUM('sudoku', 'crossword', 'word_search'),
      allowNull: false,
      field: 'TYPE'
    },
    DIFFICULTY: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      defaultValue: 'medium',
      field: 'DIFFICULTY'
    },
    XP_REWARD: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      field: 'XP_REWARD',
      validate: {
        min: {
          args: [0],
          msg: 'XP reward must be at least 0'
        }
      }
    },
    TIME_LIMIT: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true,
      field: 'TIME_LIMIT',
      validate: {
        min: {
          args: [1],
          msg: 'Time limit must be at least 1 minute'
        }
      }
    },
    PUZZLE_DATA: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'PUZZLE_DATA'
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'CREATED_BY'
    },
    IS_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'IS_ACTIVE'
    },
    COMPLETIONS_COUNT: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'COMPLETIONS_COUNT'
    },
    AVERAGE_TIME: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: true,
      field: 'AVERAGE_TIME'
    },
    CREATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CREATED_AT'
    },
    UPDATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'UPDATED_AT'
    }
  }, {
    tableName: 'PUZZLES',
    timestamps: true,
    underscored: true,
    createdAt: 'CREATED_AT',
    updatedAt: 'UPDATED_AT',
    paranoid: false,
    indexes: [
      {
        fields: ['TYPE']
      },
      {
        fields: ['DIFFICULTY']
      },
      {
        fields: ['IS_ACTIVE']
      },
      {
        fields: ['CREATED_BY']
      }
    ]
  });

  // Instance methods
  Puzzle.prototype.incrementCompletions = async function(timeTaken) {
    this.COMPLETIONS_COUNT += 1;
    
    if (this.AVERAGE_TIME) {
      this.AVERAGE_TIME = Math.round(
        (this.AVERAGE_TIME * (this.COMPLETIONS_COUNT - 1) + timeTaken) / this.COMPLETIONS_COUNT
      );
    } else {
      this.AVERAGE_TIME = timeTaken;
    }
    
    return await this.save();
  };

  // Class methods
  Puzzle.getActivePuzzles = async function(filters = {}) {
    const where = { IS_ACTIVE: true, ...filters };
    return await this.findAll({ where });
  };

  Puzzle.getPuzzlesByDifficulty = async function(difficulty) {
    return await this.findAll({
      where: {
        DIFFICULTY: difficulty,
        IS_ACTIVE: true
      }
    });
  };

  // Association setup (called in models/index.js)
  Puzzle.associate = function(models) {
    Puzzle.hasMany(models.PuzzleCompletion, {
      foreignKey: 'PUZZLE_ID',
      as: 'completions'
    });

    // If you have a User model
    // Puzzle.belongsTo(models.User, {
    //   foreignKey: 'CREATED_BY',
    //   as: 'creator'
    // });
  };
  
  return Puzzle;
}