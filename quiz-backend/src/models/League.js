export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const League = sequelize.define('League', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'NAME'
    },
    code: {
      type: DataTypes.STRING(8),
      allowNull: false,
      unique: true,
      field: 'CODE'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'DESCRIPTION'
    },
    type: {
      type: DataTypes.ENUM('public', 'private'),
      allowNull: false,
      defaultValue: 'private',
      field: 'TYPE'
    },
    creator_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'CREATOR_ID'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CREATED_AT'
    }
  }, {
    tableName: 'LEAGUE',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['CODE']
      },
      {
        fields: ['CREATOR_ID']
      },
      {
        fields: ['TYPE']
      }
    ]
  });

  // 🔗 Associations
  League.associate = (models) => {
    // Creator relationship
    League.belongsTo(models.User, {
      foreignKey: 'creator_id',
      as: 'creator'
    });

    // Members relationship
    League.hasMany(models.LeagueMember, {
      foreignKey: 'league_id',
      as: 'LeagueMembers'
    });

    // Many-to-many with Users through LeagueMember
    League.belongsToMany(models.User, {
      through: models.LeagueMember,
      foreignKey: 'league_id',
      otherKey: 'user_id',
      as: 'members'
    });
  };

  return League;
}