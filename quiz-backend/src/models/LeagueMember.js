// src/models/LeagueMember.js
export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const LeagueMember = sequelize.define('LeagueMember', {
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'USER_ID'
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'IS_ADMIN'
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'JOINED_AT'
    }
  }, {
    tableName: 'LEAGUE_MEMBER',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['LEAGUE_ID', 'USER_ID']
      },
      {
        fields: ['USER_ID']
      },
      {
        fields: ['LEAGUE_ID', 'IS_ADMIN']
      }
    ]
  });

  // 🔗 Associations
  LeagueMember.associate = (models) => {
    // League relationship
    LeagueMember.belongsTo(models.League, {
      foreignKey: 'league_id',
      as: 'league'
    });

    // User relationship
    LeagueMember.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return LeagueMember;
}