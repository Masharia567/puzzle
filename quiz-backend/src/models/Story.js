export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  const Story = sequelize.define('Story', {
    STORY_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'STORY_ID'
    },
    USER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID'
    },
    TITLE: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'TITLE'
    },
    CONTENT: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'CONTENT'
    },
    MEDIA_URL: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'MEDIA_URL'
    },
    MEDIA_TYPE: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'MEDIA_TYPE'
    },
    STATUS: {
      type: DataTypes.STRING(20),
      defaultValue: 'active',
      field: 'STATUS'
    },
    VIEW_COUNT: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'VIEW_COUNT'
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
    tableName: 'STORIES',
    timestamps: false,
    freezeTableName: true
  });

  Story.associate = (models) => {
    Story.hasMany(models.StoryMedia, { foreignKey: 'STORY_ID', as: 'media' });
    Story.hasMany(models.Comment, { foreignKey: 'STORY_ID', as: 'comments' });
  };

  return Story;
};