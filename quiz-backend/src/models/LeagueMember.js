// src/models/LeagueMember.js
export default function (sequelize) {
  const { DataTypes } = sequelize.Sequelize;

  const LeagueMember = sequelize.define('LeagueMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'ID',
    },
    league_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'LEAGUE_ID',
    },
    userId: {
      type: DataTypes.STRING(255),  // Match MICROSOFT_ID type
      field: 'USER_ID',
      allowNull: false,
      references: {
        model: 'USER',
        key: 'MICROSOFT_ID'  // Reference MICROSOFT_ID, not ID
      }
    },
  is_admin: {
  type: DataTypes.STRING(1),
  allowNull: true,
  defaultValue: 'N',  //  Already correct
  field: 'IS_ADMIN',
  validate: {
    isIn: [['Y', 'N']]  // Only allow 'Y' or 'N'
  }
},
    joined_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'JOINED_AT',
    },
  }, {
    tableName: 'LEAGUE_MEMBER',
    timestamps: false,
    freezeTableName: true,
    underscored: false,   // ← CRITICAL: stops snake_case
    indexes: [
      { unique: true, fields: ['LEAGUE_ID', 'USER_ID'] },
      { fields: ['USER_ID'] },
      { fields: ['LEAGUE_ID', 'IS_ADMIN'] },
    ],
  });



  return LeagueMember;
}