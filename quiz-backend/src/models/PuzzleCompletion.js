export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  
  const PuzzleCompletion = sequelize.define('PuzzleCompletion', {
    COMPLETION_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'COMPLETION_ID'
    },
    PUZZLE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'PUZZLE_ID'
    },
    USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID'
    },
    TIME_TAKEN: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: false,
      field: 'TIME_TAKEN'
    },
    XP_EARNED: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'XP_EARNED'
    },
    IS_CORRECT: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'IS_CORRECT'
    },
    SOLUTION_DATA: {
      type: DataTypes.TEXT, 
      allowNull: true,
      field: 'SOLUTION_DATA'
    },
    COMPLETED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'COMPLETED_AT'
    }
  }, {
    tableName: 'PUZZLE_COMPLETIONS',
    timestamps: false
  });
  
  return PuzzleCompletion;
}// models/PuzzleCompletion.js
export function PuzzleCompletionModel(sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  
  const PuzzleCompletion = sequelize.define('PuzzleCompletion', {
    COMPLETION_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'COMPLETION_ID'
    },
    PUZZLE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'PUZZLE_ID',
      references: {
        model: 'PUZZLES',
        key: 'PUZZLE_ID'
      }
    },
    USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID'
    },
    TIME_TAKEN: {
      type: DataTypes.INTEGER, // in seconds
      allowNull: false,
      field: 'TIME_TAKEN',
      validate: {
        min: {
          args: [1],
          msg: 'Time taken must be at least 1 second'
        }
      }
    },
    XP_EARNED: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'XP_EARNED',
      validate: {
        min: {
          args: [0],
          msg: 'XP earned must be at least 0'
        }
      }
    },
    IS_CORRECT: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'IS_CORRECT'
    },
    SOLUTION_DATA: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'SOLUTION_DATA'
    },
    COMPLETED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'COMPLETED_AT'
    }
  }, {
    tableName: 'PUZZLE_COMPLETIONS',
    timestamps: false,
    indexes: [
      {
        fields: ['PUZZLE_ID']
      },
      {
        fields: ['USER_ID']
      },
      {
        fields: ['COMPLETED_AT']
      },
      {
        fields: ['USER_ID', 'PUZZLE_ID']
      }
    ]
  });

  // Instance methods
  PuzzleCompletion.prototype.isPersonalBest = async function() {
    const userCompletions = await PuzzleCompletion.findAll({
      where: {
        PUZZLE_ID: this.PUZZLE_ID,
        USER_ID: this.USER_ID
      },
      order: [['TIME_TAKEN', 'ASC']]
    });

    return userCompletions.length > 0 && userCompletions[0].COMPLETION_ID === this.COMPLETION_ID;
  };

  // Class methods
  PuzzleCompletion.getUserStats = async function(userId) {
    const stats = await this.findOne({
      where: { USER_ID: userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('COMPLETION_ID')), 'totalCompletions'],
        [sequelize.fn('SUM', sequelize.col('XP_EARNED')), 'totalXP'],
        [sequelize.fn('AVG', sequelize.col('TIME_TAKEN')), 'avgTime'],
        [sequelize.fn('MIN', sequelize.col('TIME_TAKEN')), 'bestTime']
      ],
      raw: true
    });

    return {
      totalCompletions: parseInt(stats.totalCompletions) || 0,
      totalXP: parseInt(stats.totalXP) || 0,
      avgTime: stats.avgTime ? Math.round(parseFloat(stats.avgTime)) : null,
      bestTime: stats.bestTime || null
    };
  };

  // Association setup
  PuzzleCompletion.associate = function(models) {
    PuzzleCompletion.belongsTo(models.Puzzle, {
      foreignKey: 'PUZZLE_ID',
      as: 'puzzle'
    });

    // If you have a User model
    // PuzzleCompletion.belongsTo(models.User, {
    //   foreignKey: 'USER_ID',
    //   as: 'user'
    // });
  };
  
  return PuzzleCompletion;}
  