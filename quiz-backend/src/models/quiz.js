export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const Quiz = sequelize.define('Quiz', {
    QUIZ_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'QUIZ_ID'
    },
    TITLE: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'TITLE'
    },
    DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'DESCRIPTION'
    },
    CATEGORY: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'CATEGORY'
    },
    DIFFICULTY: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'medium',
      field: 'DIFFICULTY'
    },
    TIME_LIMIT: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TIME_LIMIT'
    },
    XP_REWARD: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 100,
      field: 'XP_REWARD'
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
    },
    CREATED_BY: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'CREATED_BY'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'IS_ACTIVE',
    }
  }, {
    tableName: 'QUIZZES',
    timestamps: true,
    underscored: true,
    createdAt: 'CREATED_AT',
    updatedAt: 'UPDATED_AT'
  });

  return Quiz;
}
