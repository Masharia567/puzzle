// models/UserAnswer.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UserAnswer = sequelize.define('UserAnswer', {
    answer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ANSWER_ID'
    },
    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ATTEMPT_ID'
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'QUESTION_ID'
    },
    user_answer: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'USER_ANSWER'
    },
    is_correct: {
      type: DataTypes.INTEGER,  // NUMBER(1)
      allowNull: true,
      field: 'IS_CORRECT',
      get() {
        const val = this.getDataValue('is_correct');
        return val === null ? null : val === 1;
      },
      set(val) {
        this.setDataValue('is_correct', val === null ? null : (val ? 1 : 0));
      }
    },
    points_earned: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'POINTS_EARNED'
    },
    answered_at: {
      type: DataTypes.DATE(6),  // TIMESTAMP(6)
      allowNull: true,
      field: 'ANSWERED_AT'
    }
  }, {
    tableName: 'USER_ANSWERS',
    schema: 'FUNZONE',
    timestamps: false,
    freezeTableName: true,
    underscored: false
  });

  return UserAnswer;
};