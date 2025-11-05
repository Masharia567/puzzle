// models/user.js
export default (sequelize) => {
  const { DataTypes } = sequelize.Sequelize;

  const User = sequelize.define(
    'User',
    {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'ID',
      },
      DISPLAYNAME: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'DISPLAYNAME',
      },
      MAIL: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
        field: 'MAIL',
      },
      USERPRINCIPALNAME: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        field: 'USERPRINCIPALNAME',
      },
      ROLE: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'user', // ← string, safe
        field: 'ROLE',
      },
      MOBILEPHONE: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'MOBILEPHONE',
      },
      BUSINESSPHONES: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'BUSINESSPHONES',
      },
      NICKNAME: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'NICKNAME',
      },
      DEPARTMENT: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'DEPARTMENT',
      },
      MICROSOFT_ID: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        field: 'MICROSOFT_ID',
        comment: 'Microsoft Graph User ID (UUID)',
      },
      CREATED_AT: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'CREATED_AT',
        // REMOVED: defaultValue: DataTypes.NOW → let DB use DEFAULT SYSDATE
      },
      UPDATED_AT: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'UPDATED_AT',
        // REMOVED: defaultValue: DataTypes.NOW
      },
      CREATED_BY: {
        type: DataTypes.STRING(100), // ← VARCHAR2 in DB, NOT INTEGER
        allowNull: true,
        field: 'CREATED_BY',
      },
      UPDATED_BY: {
        type: DataTypes.STRING(100), // ← VARCHAR2 in DB
        allowNull: true,
        field: 'UPDATED_BY',
      },
      // REMOVED: DEPARTMENT_ID → not in your new schema
    },
    {
      tableName: 'USERS',
      timestamps: false,
      underscored: true,
      indexes: [],
    }
  );

  // Associations
  User.associate = (models) => {
    // Removed DEPARTMENT_ID → no belongsTo
    // If you add it later, re-enable
  };

  return User;
};