export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const LeagueGame = sequelize.define('LeagueGame', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID'
    },
    league_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'LEAGUE_ID'
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'QUIZ_ID'
    },
    puzzle_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'PUZZLE_ID'
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'TITLE'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'DESCRIPTION'
    },
    type: {
      type: DataTypes.ENUM('quiz', 'puzzle'),
      allowNull: false,
      field: 'TYPE'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      defaultValue: 'medium',
      field: 'DIFFICULTY'
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'completed'),
      allowNull: false,
      defaultValue: 'upcoming',
      field: 'STATUS'
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'START_TIME'
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'END_TIME'
    },
    max_participants: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'MAX_PARTICIPANTS'
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'POINTS'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CREATED_AT'
    }
  }, {
    tableName: 'LEAGUE_GAME',
    timestamps: false,
    indexes: [
      {
        fields: ['LEAGUE_ID']
      },
      {
        fields: ['STATUS', 'START_TIME']
      },
      {
        fields: ['QUIZ_ID']
      },
      {
        fields: ['PUZZLE_ID']
      }
    ]
  });

  // 🔗 Associations
  LeagueGame.associate = (models) => {
    // League relationship
    LeagueGame.belongsTo(models.League, {
      foreignKey: 'league_id',
      as: 'league'
    });

    // Quiz relationship (optional)
    LeagueGame.belongsTo(models.Quiz, {
      foreignKey: 'quiz_id',
      as: 'quiz'
    });

    // Puzzle relationship (optional)
    LeagueGame.belongsTo(models.Puzzle, {
      foreignKey: 'puzzle_id',
      as: 'puzzle'
    });

    // Game participants
    LeagueGame.hasMany(models.LeagueGameParticipant, {
      foreignKey: 'game_id',
      as: 'participants'
    });
  };

  return LeagueGame;
}