export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const LeagueGameParticipant = sequelize.define('LeagueGameParticipant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID'
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'GAME_ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID'
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'SCORE'
    },
    time_taken_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'TIME_TAKEN_SECONDS'
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'COMPLETED'
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'JOINED_AT'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'COMPLETED_AT'
    }
  }, {
    tableName: 'LEAGUE_GAME_PARTICIPANT',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['GAME_ID', 'USER_ID']
      },
      {
        fields: ['USER_ID']
      },
      {
        fields: ['GAME_ID', 'COMPLETED']
      }
    ]
  });

  // 🔗 Associations
  LeagueGameParticipant.associate = (models) => {
    // Game relationship
    LeagueGameParticipant.belongsTo(models.LeagueGame, {
      foreignKey: 'game_id',
      as: 'game'
    });

    // User relationship
    LeagueGameParticipant.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };}