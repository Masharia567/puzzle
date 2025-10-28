export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  const Comment = sequelize.define('Comment', {
    COMMENT_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'COMMENT_ID'
    },
    STORY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'STORY_ID'
    },
    USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID'
    },
    PARENT_COMMENT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'PARENT_COMMENT_ID'
    },
    COMMENT_TEXT: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'COMMENT_TEXT'
    },
    STATUS: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      field: 'STATUS'
    },
    LIKES_COUNT: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'LIKES_COUNT'
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
    tableName: 'COMMENTS',
    timestamps: false,
    freezeTableName: true
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Story, { foreignKey: 'STORY_ID', as: 'story' });
    Comment.hasMany(models.Comment, { foreignKey: 'PARENT_COMMENT_ID', as: 'replies' });
    Comment.belongsTo(models.Comment, { foreignKey: 'PARENT_COMMENT_ID', as: 'parent' });
  };

  return Comment;
};