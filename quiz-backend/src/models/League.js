export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const League = sequelize.define(
    'League',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'NAME',
      },
      code: {
        type: DataTypes.STRING(8),
        allowNull: false,
        unique: true,
        field: 'CODE',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'DESCRIPTION',
      },
      type: {
        type: DataTypes.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'private',
        field: 'TYPE',
      },
      creatorId: {
        type: DataTypes.STRING(36),
        allowNull: true,
        field: 'CREATOR_ID', // Must match Oracle column exactly
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'CREATED_AT',
      },
    },
    {
      tableName: 'LEAGUE',
      timestamps: false,
      freezeTableName: true,
      quoteIdentifiers: true, // ⚠️ Important for Oracle
      indexes: [
        { unique: true, fields: ['CODE'] },
        { fields: ['CREATOR_ID'] },
        { fields: ['TYPE'] },
      ],
    }
  );

  // ─────────── ASSOCIATIONS ───────────
  // League.associate = (models) => {
  //   League.belongsTo(models.User, {
  //     foreignKey: 'creatorId', // must match field
  //     targetKey: 'ID',
  //     as: 'creator',
  //   });

  //   League.hasMany(models.LeagueMember, {
  //     foreignKey: 'league_id',
  //     sourceKey: 'ID',
  //     as: 'memberships',
  //   });

  //   League.belongsToMany(models.User, {
  //     through: models.LeagueMember,
  //     foreignKey: 'league_id',
  //     otherKey: 'USER_ID',
  //     as: 'members',
  //   });
  // };

  return League;
}
