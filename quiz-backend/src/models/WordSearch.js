export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  
  const WordSearch = sequelize.define('WordSearch', {
    puzzle_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'PUZZLE_ID'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'TITLE'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'CATEGORY'
    },
    difficulty: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'medium',
      field: 'DIFFICULTY',
      validate: {
        isIn: [['easy', 'medium', 'hard']]
      }
    },
    words: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'WORDS',
      get() {
        const raw = this.getDataValue('words');
        if (!raw) return [];
        if (typeof raw === 'object') return raw; // Already parsed
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.error('Error parsing words:', e);
          return [];
        }
      },
      set(value) {
        const stringValue = Array.isArray(value) ? JSON.stringify(value) : value;
        this.setDataValue('words', stringValue);
      }
    },
    grid: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'GRID',
      get() {
        const raw = this.getDataValue('grid');
        if (!raw) return [];
        if (typeof raw === 'object') return raw; // Already parsed
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.error('Error parsing grid:', e);
          return [];
        }
      },
      set(value) {
        const stringValue = Array.isArray(value) ? JSON.stringify(value) : value;
        this.setDataValue('grid', stringValue);
      }
    },
    word_placements: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'WORD_PLACEMENTS',
      get() {
        const raw = this.getDataValue('word_placements');
        if (!raw) return [];
        if (typeof raw === 'object') return raw; // Already parsed
        try {
          return JSON.parse(raw);
        } catch (e) {
          console.error('Error parsing word_placements:', e);
          return [];
        }
      },
      set(value) {
        const stringValue = Array.isArray(value) ? JSON.stringify(value) : value;
        this.setDataValue('word_placements', stringValue);
      }
    },
    grid_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
      field: 'GRID_SIZE'
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'IS_PUBLISHED'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'CREATED_BY'
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
    tableName: 'WORD_SEARCH_PUZZLES',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false  // Explicitly disable soft deletes
  });

  WordSearch.associate = function(models) {
    WordSearch.hasMany(models.WordSearchCompletion, {
      foreignKey: 'puzzle_id',
      as: 'completions'
    });
    
    if (models.User) {
      WordSearch.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
    }
  };

  return WordSearch;
}