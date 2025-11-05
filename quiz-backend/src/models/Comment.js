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
   COMMENT_TEXT: {
  type: DataTypes.STRING(4000),
  allowNull: false,
  field: 'COMMENT_TEXT'
},
    PARENT_COMMENT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'PARENT_COMMENT_ID'
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

  // ADD THIS: belongsTo association
  Comment.associate = (models) => {
    Comment.belongsTo(models.Story, { foreignKey: 'STORY_ID', as: 'story' });
    Comment.belongsTo(models.User, { foreignKey: 'USER_ID', as: 'user' });
    Comment.hasMany(models.Comment, { foreignKey: 'PARENT_COMMENT_ID', as: 'replies' });
  };

  return Comment;
};