export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const OpencircleQuiz = sequelize.define(
    'OpencircleQuiz',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID'
      },
      author: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'AUTHOR'
      },
      avatar: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'AVATAR'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'TITLE'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'CONTENT'
      },
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'LIKES'
      },
      isMyPost: {
        type: DataTypes.CHAR(1),
        defaultValue: 'N',
        validate: {
          isIn: [['Y','N']]
        },
        field: 'IS_MY_POST'
      },
      trending: {
        type: DataTypes.CHAR(1),
        defaultValue: 'N',
        validate: {
          isIn: [['Y','N']]
        },
        field: 'TRENDING'
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isUppercase: true
        },
        set(value) {
          this.setDataValue('type', value.toUpperCase());
        },
        field: 'TYPE'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'CREATED_AT'
      }
    },
    {
      tableName: 'OPENCIRCLE_QUIZ',
      timestamps: false
    }
  );

  OpencircleQuiz.associate = (models) => {
    OpencircleQuiz.hasMany(models.OpencircleComment, {
      foreignKey: 'quizId',
      as: 'comments',
      onDelete: 'CASCADE'
    });
  };

  return OpencircleQuiz;
}
