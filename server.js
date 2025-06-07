const express = require('express');
const session = require('express-session');
const path = require('path');
const { connectAll } = require('./config/database');

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session 配置
app.use(session({
  secret: 'nav-site-admin-secret-key-2024', // 生产环境中应该使用环境变量
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 生产环境中如果使用HTTPS应设为true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

// 根路径处理
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
async function startServer() {
  try {
    console.log('正在启动服务器...');

    // 设置超时时间
    const timeout = setTimeout(() => {
      console.log('⚠️  数据库连接超时，使用模拟数据启动服务器...');
      startWithMockData();
    }, 10000); // 10秒超时

    try {
      // 尝试连接数据库
      const connected = await connectAll();
      clearTimeout(timeout);

      if (connected) {
        console.log('✅ 数据库连接成功，启动完整功能服务器');
        startWithDatabase();
      } else {
        console.log('⚠️  数据库连接失败，使用模拟数据启动服务器');
        startWithMockData();
      }
    } catch (dbError) {
      clearTimeout(timeout);
      console.log('⚠️  数据库连接出错，使用模拟数据启动服务器:', dbError.message);
      startWithMockData();
    }
  } catch (error) {
    console.error('❌ 启动服务器时出错:', error);
    process.exit(1);
  }
}

// 使用数据库启动
function startWithDatabase() {
  // 设置数据库路由
  app.use('/api/categories', require('./routes/categories'));
  app.use('/api/stats', require('./routes/stats'));
  app.use('/admin', require('./routes/admin'));

  // 添加站点设置API（数据库模式）
  app.get('/api/site-settings', async (req, res) => {
    try {
      const SiteSetting = require('./models/SiteSetting');
      const settings = await SiteSetting.getSetting();
      res.json(settings);
    } catch (err) {
      console.log('数据库操作失败，返回默认设置:', err.message);
      res.json({
        siteName: '我的导航网站',
        logo: '',
        icpNumber: '',
        policeNumber: '',
        startTime: new Date('2024-01-01'),
        announcement: {
          enabled: false,
          title: '',
          content: '',
          countdown: 10,
          showOnce: true,
          createdAt: new Date()
        },
        updatedAt: new Date()
      });
    }
  });

  setupCommonRoutes();
  startHttpServer('完整功能');
}

// 使用模拟数据启动
function startWithMockData() {
  // 模拟数据
  const mockData = [
    {
      id: "1",
      name: "搜索引擎",
      links: [
        { _id: "1", title: "Google", url: "https://www.google.com", description: "全球最大的搜索引擎", customIcon: null },
        { _id: "2", title: "百度", url: "https://www.baidu.com", description: "中国最大的搜索引擎", customIcon: null }
      ]
    },
    {
      id: "2",
      name: "开发工具",
      links: [
        { _id: "3", title: "GitHub", url: "https://github.com", description: "代码托管平台", customIcon: null },
        { _id: "4", title: "Stack Overflow", url: "https://stackoverflow.com", description: "程序员问答社区", customIcon: null }
      ]
    },
    {
      id: "3",
      name: "技术论坛",
      links: [
        { _id: "5", title: "掘金", url: "https://juejin.cn", description: "技术社区", customIcon: null }
      ]
    },
    {
      id: "4",
      name: "在线AI",
      links: [
        { _id: "6", title: "ChatGPT", url: "https://chat.openai.com", description: "OpenAI的对话AI", customIcon: "https://cdn.openai.com/API/logo-openai.svg" }
      ]
    }
  ];

  // 设置模拟API路由
  app.get('/api/categories', (req, res) => {
    res.json(mockData);
  });

  app.post('/api/stats/visit', (req, res) => {
    res.status(200).send();
  });

  app.post('/api/stats/click/:id', (req, res) => {
    res.status(200).send();
  });

  // 模拟统计API
  app.get('/api/stats', (req, res) => {
    res.json({
      visits: 1234,
      categories: 4,
      links: 6
    });
  });

  // 模拟站点设置API
  app.get('/api/site-settings', (req, res) => {
    res.json({
      siteName: '我的导航网站',
      logo: '',
      icpNumber: '',
      policeNumber: '',
      startTime: new Date('2024-01-01'),
      announcement: {
        enabled: false,
        title: '',
        content: '',
        countdown: 10,
        showOnce: true,
        createdAt: new Date()
      },
      updatedAt: new Date()
    });
  });

  // 设置admin路由（即使在模拟模式下也需要）
  app.use('/admin', require('./routes/admin'));

  setupCommonRoutes();
  startHttpServer('模拟数据');
}

// 设置通用路由
function setupCommonRoutes() {
  // 404 处理
  app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  });

  // 错误处理
  app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).send('服务器内部错误');
  });
}

// 启动HTTP服务器
function startHttpServer(mode) {
  const server = app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT} (${mode}模式)`);
    console.log('🎨 新布局特性:');
    console.log('  - 左侧分类导航栏');
    console.log('  - 固定宽度1200px居中布局');
    console.log('  - 分类筛选功能');
    console.log('  - 响应式设计');
    console.log('  - 智能图标显示');
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${PORT} 已被占用，请先停止其他服务或使用其他端口`);
      process.exit(1);
    } else {
      console.error('❌ 服务器启动错误:', error);
      process.exit(1);
    }
  });
}

// 启动应用
startServer();


