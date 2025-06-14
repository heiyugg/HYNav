# 🌐 网站导航系统

一个功能完整的现代化网站导航系统，支持分类管理、链接管理、站点设置和访问统计等功能。

## ✨ 功能特性

### 🎨 前台功能
- **现代化设计**: 响应式布局，支持桌面和移动端
- **分类导航**: 左侧分类导航栏，固定宽度1200px居中布局
- **智能搜索**: 支持多搜索引擎（百度、Google、Bing）
- **图标显示**: 智能网站图标获取，支持多重备选方案
- **运行时间**: 实时显示网站运行时长

### 🔧 后台管理
- **仪表盘**: 网站统计、图表展示、密码修改
- **分类管理**: 添加、编辑、删除分类，支持排序
- **链接管理**: 添加、编辑、删除链接，支持搜索和筛选
- **站点设置**: 网站名称、Logo、备案信息、运行时间独立设置
- **安全管理**: 永久密码修改，会话管理

### 📊 统计功能
- **访问统计**: 页面访问量、链接点击量统计
- **图表展示**: 7/14/30天数据图表
- **实时数据**: 动态更新统计信息

### 本地部署

```bash
# 安装依赖
npm install

# 启动服务器
node server.js
```

启动后访问：http://localhost:3000

## 📁 项目结构

```
├── config/                 # 配置文件
│   └── database.js         # 数据库配置
├── data/                   # 数据存储
│   └── admin_password.json # 管理员密码文件
├── models/                 # 数据模型
│   ├── AdminPassword.js    # 密码管理模型
│   ├── Category.js         # 分类模型
│   ├── Link.js            # 链接模型
│   ├── SiteSetting.js     # 站点设置模型
│   └── Stats.js           # 统计模型
├── public/                 # 前端静态文件
│   ├── admin/             # 后台管理页面
│   │   ├── index.html     # 后台主页
│   │   └── login.html     # 登录页面
│   ├── css/               # 样式文件
│   │   └── style.css      # 主样式文件
│   ├── js/                # JavaScript文件
│   │   └── main.js        # 主脚本文件
│   ├── 404.html           # 404错误页面
│   └── index.html         # 前台主页
├── routes/                 # 路由文件
│   ├── admin.js           # 后台管理路由
│   ├── categories.js      # 分类API路由
│   └── stats.js           # 统计API路由
├── package.json           # 项目配置
├── package-lock.json      # 依赖锁定文件
├── server.js              # 服务器入口文件
├── healthcheck.js         # 健康检查脚本
└── README.md              # 项目说明文档
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+), Chart.js
- **后端**: Node.js, Express.js, Express-Session
- **数据库**: MongoDB (Mongoose) + 模拟数据支持
- **工具**: Axios, Cheerio (网站信息抓取)
- **安全**: SHA-256密码加密，文件存储

## 🎯 核心功能

### 🏠 前台展示
- **分类导航**: 左侧固定导航，支持分类筛选
- **链接展示**: 卡片式布局，智能图标显示
- **搜索功能**: 集成多个搜索引擎
- **响应式设计**: 适配各种屏幕尺寸

### 🔐 后台管理
- **权限控制**: 登录验证，会话管理
- **数据管理**: CRUD操作，批量管理
- **设置配置**: 站点信息，运行时间独立设置
- **安全功能**: 密码加密存储，永久修改

### 📈 数据统计
- **访问追踪**: 页面访问量统计
- **点击统计**: 链接点击量记录
- **图表展示**: 可视化数据展示
- **时间范围**: 支持多时间段查看

## 🔧 配置说明

### 数据库配置
- 支持MongoDB数据库
- 自动降级到模拟数据模式
- 无需数据库即可运行

### 环境要求
- Node.js 14.0+
- MongoDB 4.0+ (可选)
- 现代浏览器支持

## 📝 使用说明

### 初次使用
1. 启动服务器
2. 访问后台管理页面 (http://localhost:3000/admin)
3. 使用默认账号登录 (admin/admin123)
4. 修改管理员密码
5. 配置站点基本信息
6. 添加分类和链接

### 日常管理
1. 添加新的网站链接
2. 管理分类结构
3. 查看访问统计
4. 更新站点设置

## 🔒 安全特性

- **密码加密**: SHA-256 + 盐值加密
- **会话管理**: Express-Session安全会话
- **权限验证**: 后台操作权限控制
- **数据验证**: 输入数据安全验证

## 📄 许可证

MIT License

---

🎉 享受您的现代化导航网站！
