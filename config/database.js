const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

// 数据库连接配置
const config = {
  host: '127.0.0.1',
  port: 27017,
  database: 'HYNav',
  username: '',
  password: '',
  authSource: 'admin'
};

// 连接选项
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000
};

// 全局数据库连接对象
let dbClient = null;
let db = null;
let mongooseConnected = false;

/**
 * 连接到 MongoDB 数据库 (原生驱动)
 * @returns {Promise<boolean>} 连接是否成功
 */
const connectDB = async () => {
  if (db) {
    console.log('原生MongoDB数据库已连接，使用现有连接');
    return true;
  }

  try {
    console.log('正在连接到 MongoDB 数据库 (原生驱动)...');

    // 构建连接字符串
    const uri = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=${config.authSource}`;

    // 创建客户端并连接
    dbClient = new MongoClient(uri, options);
    await dbClient.connect();

    // 获取数据库引用
    db = dbClient.db(config.database);

    // 测试连接
    await db.command({ ping: 1 });

    console.log('MongoDB 数据库连接成功 (原生驱动)');
    return true;
  } catch (error) {
    console.error('MongoDB 数据库连接失败 (原生驱动):', error.message);

    // 清理资源
    if (dbClient) {
      await dbClient.close().catch(console.error);
      dbClient = null;
      db = null;
    }

    return false;
  }
};

/**
 * 连接到 MongoDB 数据库 (Mongoose)
 * @returns {Promise<boolean>} 连接是否成功
 */
const connectMongoose = async () => {
  if (mongooseConnected) {
    console.log('Mongoose已连接，使用现有连接');
    return true;
  }

  try {
    console.log('正在连接到 MongoDB 数据库 (Mongoose)...');

    // 构建连接字符串
    const uri = `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=${config.authSource}`;

    // 连接Mongoose
    await mongoose.connect(uri, options);

    mongooseConnected = true;
    console.log('MongoDB 数据库连接成功 (Mongoose)');

    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose 连接错误:', err);
      mongooseConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose 连接断开');
      mongooseConnected = false;
    });

    return true;
  } catch (error) {
    console.error('Mongoose 连接失败:', error.message);
    mongooseConnected = false;
    return false;
  }
};

/**
 * 获取数据库连接 (原生驱动)
 * @returns {object|null} 数据库连接对象
 */
const getDB = () => {
  if (!db) {
    console.warn('尝试获取数据库连接，但连接尚未建立');
  }
  return db;
};

/**
 * 获取Mongoose连接状态
 * @returns {boolean} Mongoose是否已连接
 */
const isMongooseConnected = () => {
  return mongooseConnected && mongoose.connection.readyState === 1;
};

/**
 * 关闭数据库连接
 * @returns {Promise<void>}
 */
const closeDB = async () => {
  // 关闭原生MongoDB连接
  if (dbClient) {
    await dbClient.close();
    console.log('MongoDB 数据库连接已关闭 (原生驱动)');
    dbClient = null;
    db = null;
  }

  // 关闭Mongoose连接
  if (mongooseConnected) {
    await mongoose.disconnect();
    console.log('MongoDB 数据库连接已关闭 (Mongoose)');
    mongooseConnected = false;
  }
};

/**
 * 连接所有数据库 (原生驱动 + Mongoose)
 * @returns {Promise<boolean>} 连接是否成功
 */
const connectAll = async () => {
  try {
    // 连接原生驱动
    const nativeConnected = await connectDB();

    // 连接Mongoose
    const mongooseConnected = await connectMongoose();

    return nativeConnected && mongooseConnected;
  } catch (error) {
    console.error('连接数据库时出错:', error);
    return false;
  }
};

// 应用关闭时关闭数据库连接
process.on('SIGINT', async () => {
  await closeDB();
  console.log('应用终止，数据库连接已关闭');
  process.exit(0);
});

module.exports = {
  connectDB,
  connectMongoose,
  connectAll,
  getDB,
  isMongooseConnected,
  closeDB,
  config // 导出配置供其他地方使用
};


