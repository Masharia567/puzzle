// models/user.js
export default (sequelize) => {
  const { DataTypes } = sequelize.Sequelize;

  const User = sequelize.define('User', {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'ID'
    },
    USERNAME: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'USERNAME'
    },
    EMAIL: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      field: 'EMAIL'
    },
    PASSWORD: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'PASSWORD'
    },
    ROLE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'ROLE_ID'
    },
    DEPARTMENT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'DEPARTMENT_ID'
    },
    STATUS: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
      field: 'STATUS'
    },
    EMAIL_VERIFIED: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'EMAIL_VERIFIED'
    },
    LASTLOGIN: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'LAST_LOGIN'
    },
    CREATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'CREATED_AT'
    },
    UPDATED_AT: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'UPDATED_AT'
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'CREATED_BY'
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'UPDATED_BY'
    }
  }, {
    tableName: 'USERS',
    timestamps: false, // Disable default timestamps since we define them manually
    underscored: true
  });

  // Define associations here if needed (example placeholders)
  User.associate = (models) => {
    User.belongsTo(models.Role, { foreignKey: 'ROLE_ID', as: 'role' });
    User.belongsTo(models.Department, { foreignKey: 'DEPARTMENT_ID', as: 'department' });
  };

  return User;
};
