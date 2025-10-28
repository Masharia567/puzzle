export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const WordLegendUserProgress = sequelize.define(
    "WordLegendUserProgress",
    {
      PROGRESS_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: "PROGRESS_ID",
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
      FOUND_WORDS: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "FOUND_WORDS",
      },
      SCORE: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "SCORE",
      },
      TIME_SPENT: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "TIME_SPENT",
      },
      COMPLETED: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "COMPLETED",
      },
    },
    {
      tableName: "WORDLEGEND_USER_PROGRESS",
      timestamps: false,
    }
  );

  return WordLegendUserProgress;
}
