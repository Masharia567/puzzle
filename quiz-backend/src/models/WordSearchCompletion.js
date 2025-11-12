export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  
  const WordSearchCompletion = sequelize.define('WordSearchCompletion', {
    completion_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'COMPLETION_ID'
    },
    puzzle_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'PUZZLE_ID',
      references: {
        model: 'WORD_SEARCH_PUZZLES',
        key: 'PUZZLE_ID'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID',
      references: {
        model: 'USERS',
        key: 'USER_ID'
      }
    },
    words_found: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'WORDS_FOUND',
      get() {
        const raw = this.getDataValue('words_found');
        return raw ? JSON.parse(raw) : [];
      },
      set(value) {
        this.setDataValue('words_found', JSON.stringify(value));
      }
    },
    time_taken: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TIME_TAKEN'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'SCORE'
    },
    percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'PERCENTAGE'
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'IS_COMPLETED'
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'STARTED_AT'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'COMPLETED_AT'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CREATED_AT'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'UPDATED_AT'
    }
  }, {
    tableName: 'WORD_SEARCH_COMPLETIONS',
    timestamps: true,
     paranoid: false, 
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  WordSearchCompletion.associate = function(models) {
    WordSearchCompletion.belongsTo(models.WordSearch, {
      foreignKey: 'puzzle_id',
      as: 'puzzle'
    });
    
    if (models.User) {
      WordSearchCompletion.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  };

  return WordSearchCompletion;
}