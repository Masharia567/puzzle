export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const Quiz = sequelize.define('Quiz', {
    quiz_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'QUIZ_ID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'TITLE'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'DESCRIPTION'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'CATEGORY'
    },
    difficulty: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'medium',
      field: 'DIFFICULTY'
    },
    time_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TIME_LIMIT'
    },
    xp_reward: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 100,
      field: 'XP_REWARD'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'IS_ACTIVE'
    },
    created_by: {
      type: DataTypes.STRING(100),
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
    tableName: 'QUIZZES',
    timestamps: true,
    paranoid: false,
    underscored: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // Explicitly tell Sequelize not to use deletedAt
    deletedAt: false
  });

  return Quiz;
}