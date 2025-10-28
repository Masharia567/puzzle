export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;
  const StoryMedia = sequelize.define('StoryMedia', {
    MEDIA_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'MEDIA_ID'
    },
    STORY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'STORY_ID'
    },
    MEDIA_URL: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'MEDIA_URL'
    },
    MEDIA_TYPE: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'MEDIA_TYPE'
    },
    MEDIA_SIZE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'MEDIA_SIZE'
    },
    DISPLAY_ORDER: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'DISPLAY_ORDER'
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
    tableName: 'STORY_MEDIA',
    timestamps: false,
    freezeTableName: true
  });

  StoryMedia.associate = (models) => {
    StoryMedia.belongsTo(models.Story, { foreignKey: 'STORY_ID', as: 'story' });
  };

  return StoryMedia;
};