import db from './src/config/database.js';

async function testConnection() {
  try {
    console.log('🚀 Starting database connection test...\n');
    
    // Initialize database connection
    const sequelize = await db.initialize();
    
    console.log('\n🎉 SUCCESS! Database is connected and ready to use.\n');
    
    // Optional: Run a test query
    console.log('📊 Running test query...');
    const [results] = await sequelize.query('SELECT SYSDATE FROM DUAL');
    console.log('Current database time:', results[0].SYSDATE);
    
    console.log('\n🔍 Connection pool info:');
    console.log('Pool size:', sequelize.connectionManager.pool.size);
    
    // Close the connection
    console.log('\n🔌 Closing database connection...');
    await sequelize.close();
    console.log('✅ Connection closed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Connection test failed!');
    console.error('Error:', error.message);
    console.error('\n📝 Troubleshooting tips:');
    console.error('1. Check your .env.local file has correct credentials');
    console.error('2. Verify Oracle database is running');
    console.error('3. Check firewall and network connectivity');
    console.error('4. Verify Oracle listener is running: lsnrctl status');
    console.error('5. Make sure Oracle Instant Client is installed');
    process.exit(1);
  }
}

// Run the test
testConnection();