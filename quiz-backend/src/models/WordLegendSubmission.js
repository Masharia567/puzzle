export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const WordLegendSubmission = sequelize.define(
    "WordLegendSubmission",
    {
      SUBMISSION_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: "SUBMISSION_ID",
      },
      USER_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "USER_ID",
      },
      PUZZLE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "PUZZLE_ID",
      },
      WORD: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "WORD",
      },
      IS_VALID: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "IS_VALID",
      },
      CREATED_AT: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: "CREATED_AT",
      },
    },
    {
      tableName: "WORDLEGEND_SUBMISSIONS",
      timestamps: false,
    }
  );

  return WordLegendSubmission;
}
