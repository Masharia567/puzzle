export default function(sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const OpencircleComment = sequelize.define(
    'OpencircleComment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID'
      },
      quizId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'QUIZ_ID'
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
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'TEXT'
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
      tableName: 'OPENCIRCLE_COMMENTS',
      timestamps: false
    }
  );

  OpencircleComment.associate = (models) => {
    OpencircleComment.belongsTo(models.OpencircleQuiz, {
      foreignKey: 'quizId',
      as: 'quiz'
    });
  };

  return OpencircleComment;
}
