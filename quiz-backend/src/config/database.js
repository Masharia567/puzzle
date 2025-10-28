import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config(); // Loads .env by default

const env = process.env.NODE_ENV || 'development';

// List of required environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST', 'DB_PORT'];

// Create a Sequelize instance
let sequelize;

async function initializeSequelize() {
  try {
    // Validate required environment variables
    console.log('🔍 Validating environment variables...');
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }
    console.log('✅ All required environment variables found');

    // Oracle connection configuration
    const connectionString = `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT}))(CONNECT_DATA=(SERVICE_NAME=${process.env.DB_NAME})))`;
    
    console.log('\n📡 Attempting to connect to Oracle with:');
    console.log({
      username: process.env.DB_USER,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      connectionString: connectionString
    });

    sequelize = new Sequelize({
      dialect: 'oracle',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      // logging: env === 'development' ? console.log : false,
      logging: false,
      define: {
        schema: process.env.DB_USER.toUpperCase(), // Ensure uppercase for Oracle
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        paranoid: true,
      },
      dialectOptions: {
        connectString: connectionString,
        autoCommit: true,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    });

    // Test the connection
    console.log('\n⏳ Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Connection to the Oracle database has been established successfully.');

    return sequelize;
  } catch (error) {
    console.error('\n❌ Error initializing Sequelize:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Initialize and export the sequelize instance
let dbInstance = null;

const db = {
  Sequelize,
  get sequelize() {
    if (!dbInstance) {
      throw new Error('Database not initialized. Call db.initialize() first.');
    }
    return dbInstance;
  },
  initialize: async () => {
    if (!dbInstance) {
      dbInstance = await initializeSequelize();
    }
    return dbInstance;
  }
};

export default db;