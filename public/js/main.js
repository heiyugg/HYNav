// 全局变量
let allCategories = [];
let currentCategoryId = 'all';
let siteSettings = {};

// 数据刷新相关变量
let lastDataHash = null;

// 分类图标映射
const categoryIcons = {
    '常用网站': '📋',
    '技术论坛': '💻',
    '在线AI': '🤖',
    '云服务器': '☁️',
    '游戏资源': '🎮',
    '影音视听': '🎬',
    '软件工具': '🔧',
    '资源网站': '📚',
    '搜索引擎': '🔍',
    '开发工具': '⚙️',
    '社交媒体': '💬',
    '新闻资讯': '📰'
};

// 获取站点设置
async function fetchSiteSettings() {
    try {
        console.log('正在获取站点设置...');
        const response = await fetch('/api/site-settings');

        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }

        const settings = await response.json();
        console.log('获取到站点设置:', settings);

        siteSettings = settings;
        applySiteSettings(settings);
    } catch (error) {
        console.error('获取站点设置失败:', error);
        // 使用默认设置
        siteSettings = {
            siteName: '网站导航',
            logo: '',
            icpNumber: '',
            policeNumber: '',
            startTime: new Date('2024-01-01')
        };
        applySiteSettings(siteSettings);
    }
}

// 应用站点设置
function applySiteSettings(settings) {
    console.log('正在应用站点设置:', settings);

    // 更新页面标题
    document.getElementById('page-title').textContent = settings.siteName || '网站导航';

    // 更新Logo
    const logoContainer = document.getElementById('site-logo');
    const logoIcon = document.getElementById('logo-icon');
    const logoText = document.getElementById('logo-text');

    if (settings.logo && settings.logo.trim()) {
        // 有自定义Logo，显示图片在上方，网站名称在下方
        logoContainer.innerHTML = `
            <img src="${settings.logo}" alt="${settings.siteName}" class="logo-image"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; this.nextElementSibling.nextElementSibling.style.display='block';">
            <div class="logo-icon" style="display: none;">${settings.siteName.charAt(0).toUpperCase()}</div>
            <div class="logo-text">${settings.siteName}</div>
        `;
    } else {
        // 没有Logo，显示文字图标和网站名称
        logoIcon.textContent = settings.siteName.charAt(0).toUpperCase();
        logoText.textContent = settings.siteName;
    }

    // 添加Logo点击事件，点击返回首页并刷新数据
    logoContainer.addEventListener('click', async function() {
        // 添加点击效果
        logoContainer.style.transform = 'scale(0.95)';
        setTimeout(() => {
            logoContainer.style.transform = 'scale(1)';
        }, 150);

        // 移除所有分类的active状态
        const categoryNavLinks = document.querySelectorAll('.category-nav a');
        categoryNavLinks.forEach(link => link.classList.remove('active'));

        // 设置"所有分类"为active状态
        const allCategoriesLink = document.querySelector('.category-nav a[data-category="all"]');
        if (allCategoriesLink) {
            allCategoriesLink.classList.add('active');
        }

        // 刷新数据并渲染所有分类的链接
        currentCategoryId = 'all';
        await refreshData();

        // 确保显示所有分类
        renderLinks('all');
    });

    // 添加Logo的提示属性
    logoContainer.setAttribute('title', '点击返回首页并刷新数据');

    // 更新版权信息
    const currentYear = new Date().getFullYear();
    document.getElementById('copyright-text').textContent =
        `© ${currentYear} ${settings.siteName}. All rights reserved.`;

    // 更新备案信息
    const icpSection = document.getElementById('icp-section');
    const policeSection = document.getElementById('police-section');

    if (settings.icpNumber && settings.icpNumber.trim()) {
        document.getElementById('icp-number').textContent = settings.icpNumber;
        icpSection.style.display = 'block';
        console.log('ICP备案号已显示:', settings.icpNumber);
    } else {
        icpSection.style.display = 'none';
    }

    if (settings.policeNumber && settings.policeNumber.trim()) {
        document.getElementById('police-number').textContent = settings.policeNumber;
        policeSection.style.display = 'block';
        console.log('公安备案号已显示:', settings.policeNumber);
    } else {
        policeSection.style.display = 'none';
    }

    // 更新运行时间
    if (settings.startTime) {
        initRuntimeWithStartTime(new Date(settings.startTime));
    } else {
        initRuntimeWithStartTime(new Date('2024-01-01'));
    }
}

// 获取分类和链接数据
async function fetchData(isRefresh = false) {
    try {
        console.log(isRefresh ? '正在刷新数据...' : '正在获取数据...');
        const response = await fetch('/api/categories');

        if (!response.ok) {
            throw new Error(`HTTP错误! 状态: ${response.status}`);
        }

        const data = await response.json();
        console.log('获取到数据:', data);

        // 计算数据哈希值用于检测变化
        const dataHash = generateDataHash(data);

        // 如果是刷新且数据没有变化，则不需要重新渲染
        if (isRefresh && lastDataHash === dataHash) {
            console.log('数据未发生变化，跳过重新渲染');
            return false; // 返回false表示数据未变化
        }

        // 更新数据哈希值
        lastDataHash = dataHash;

        allCategories = data;
        renderCategoryNav(data);
        renderLinks(currentCategoryId);

        // 只在首次加载时记录访问量
        if (!isRefresh) {
            fetch('/api/stats/visit', { method: 'POST' }).catch(err => {
                console.log('记录访问量失败:', err);
            });
        }

        console.log(isRefresh ? '数据刷新完成' : '数据加载完成');
        return true; // 返回true表示数据已更新
    } catch (error) {
        console.error('获取数据失败:', error);
        if (!isRefresh) {
            showError('无法加载数据，请刷新页面重试');
        }
        return false;
    }
}

// 生成数据哈希值用于检测变化
function generateDataHash(data) {
    try {
        // 简单的哈希算法，基于数据的JSON字符串
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString();
    } catch (error) {
        console.error('生成数据哈希失败:', error);
        return Date.now().toString(); // 降级方案
    }
}

// 手动刷新数据（通过Logo点击触发）
async function refreshData() {
    try {
        await fetchData(true);
        // 静默刷新，不显示任何通知
    } catch (error) {
        console.error('手动刷新失败:', error);
        // 即使失败也不显示通知，保持界面简洁
    }
}

// 显示刷新通知
function showRefreshNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #3b82f6;
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);

    // 2秒后隐藏并移除
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2000);
}



// 显示错误信息
function showError(message) {
    const container = document.getElementById('links-container');
    container.innerHTML = `
        <div class="empty-state">
            <h3>😕 ${message}</h3>
            <p>请刷新页面重试</p>
        </div>
    `;
}

// 渲染分类导航
function renderCategoryNav(categories) {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    // 添加"所有分类"选项
    const allItem = document.createElement('li');
    allItem.innerHTML = `
        <a href="#" data-category="all" class="active">
            <span class="category-icon">📁</span>
            <span>所有分类</span>
            <span class="category-count">${getTotalLinksCount()}</span>
        </a>
    `;
    categoryList.appendChild(allItem);

    // 添加各个分类
    categories.forEach(category => {
        const linkCount = category.links ? category.links.length : 0;
        const icon = categoryIcons[category.name] || '📄';

        const item = document.createElement('li');
        item.innerHTML = `
            <a href="#" data-category="${category.id}">
                <span class="category-icon">${icon}</span>
                <span>${category.name}</span>
                <span class="category-count">${linkCount}</span>
            </a>
        `;
        categoryList.appendChild(item);
    });

    // 添加点击事件
    categoryList.addEventListener('click', handleCategoryClick);
}

// 处理分类点击事件
function handleCategoryClick(e) {
    e.preventDefault();
    const link = e.target.closest('a');
    if (!link) return;

    const categoryId = link.getAttribute('data-category');

    // 更新活动状态
    document.querySelectorAll('.category-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    // 渲染对应的链接
    renderLinks(categoryId);
    currentCategoryId = categoryId;
}

// 渲染链接
function renderLinks(categoryId) {
    const container = document.getElementById('links-container');
    const titleEl = document.getElementById('current-category-title');

    // 清空容器
    container.innerHTML = '';

    if (categoryId === 'all') {
        // 显示所有分类，按分类分组，不显示顶部标题
        titleEl.style.display = 'none';
        renderAllCategoriesGrouped(container);
    } else {
        // 显示特定分类的链接，隐藏顶部标题
        titleEl.style.display = 'none';
        const category = allCategories.find(cat => cat.id === categoryId);
        if (category) {
            renderSingleCategory(container, category);
        } else {
            showEmptyState(container, '分类不存在');
        }
    }
}

// 渲染所有分类（分组显示）
function renderAllCategoriesGrouped(container) {
    let hasAnyLinks = false;

    allCategories.forEach(category => {
        if (category.links && category.links.length > 0) {
            hasAnyLinks = true;

            // 创建分类区域
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';

            // 分类标题
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            const icon = categoryIcons[category.name] || '📄';
            categoryHeader.innerHTML = `
                <h2 class="category-title">
                    <span class="category-icon">${icon}</span>
                    <span>${category.name}</span>
                    <span class="category-count">${category.links.length}</span>
                </h2>
            `;

            // 链接网格
            const linksGrid = document.createElement('div');
            linksGrid.className = 'category-links-grid';

            category.links.forEach(link => {
                linksGrid.appendChild(createLinkCard(link));
            });

            categorySection.appendChild(categoryHeader);
            categorySection.appendChild(linksGrid);
            container.appendChild(categorySection);
        }
    });

    if (!hasAnyLinks) {
        showEmptyState(container, '暂无任何链接');
    }
}

// 渲染单个分类
function renderSingleCategory(container, category) {
    // 创建分类标题区域
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'single-category-header';
    const icon = categoryIcons[category.name] || '📄';
    categoryHeader.innerHTML = `
        <h2 class="single-category-title">
            <span class="category-icon">${icon}</span>
            <span>${category.name}</span>
            <span class="category-count">${category.links ? category.links.length : 0}</span>
        </h2>
    `;

    container.appendChild(categoryHeader);

    if (!category.links || category.links.length === 0) {
        showEmptyState(container, '该分类下还没有添加任何链接');
        return;
    }

    // 创建链接网格
    const linksGrid = document.createElement('div');
    linksGrid.className = 'single-category-grid';

    category.links.forEach(link => {
        linksGrid.appendChild(createLinkCard(link));
    });

    container.appendChild(linksGrid);
}

// 显示空状态
function showEmptyState(container, message) {
    container.innerHTML = `
        <div class="empty-state">
            <h3>😕 ${message}</h3>
            <p>请添加一些链接</p>
        </div>
    `;
}

// 获取总链接数量
function getTotalLinksCount() {
    let total = 0;
    allCategories.forEach(category => {
        if (category.links) {
            total += category.links.length;
        }
    });
    return total;
}

// 创建链接卡片
function createLinkCard(link) {
    const card = document.createElement('div');
    card.className = 'link-card';

    // 获取网站图标和域名
    const domain = new URL(link.url).hostname;
    const origin = new URL(link.url).origin;

    // 多重备选favicon源（优先使用自定义图标）
    const faviconSources = [];

    // 如果有自定义图标，优先使用
    if (link.customIcon && link.customIcon.trim()) {
        faviconSources.push(link.customIcon.trim());
    }

    // 添加默认的备选图标源
    faviconSources.push(
        `${origin}/favicon.ico`,                                    // 网站自身favicon（最直接可靠）
        `${origin}/favicon.png`,                                   // PNG格式favicon
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`, // Google图标服务
        `${origin}/apple-touch-icon.png`,                          // Apple图标
        `${origin}/apple-touch-icon-152x152.png`,                  // Apple高清图标
        `${origin}/android-chrome-192x192.png`,                    // Android图标
        `https://icons.duckduckgo.com/ip3/${domain}.ico`           // DuckDuckGo图标服务
    );

    // 获取标题首字符作为备用图标
    const firstChar = link.title.charAt(0).toUpperCase();

    // 生成随机颜色（基于标题生成一致的颜色）
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const colorIndex = link.title.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];

    card.innerHTML = `
        <div class="card-header">
            <div class="icon-container">
                <img src="${faviconSources[0]}" alt="${link.title}" class="site-icon" style="display: block;">
                <div class="fallback-icon" style="display: none; background-color: ${bgColor};">${firstChar}</div>
            </div>
            <h3 class="card-title">${link.title}</h3>
        </div>
        <p class="card-description">${link.description || '暂无描述'}</p>
        <div class="card-footer">
            <span class="card-url">${domain}</span>
            <a href="${link.url}" data-id="${link._id}" class="link-btn" target="_blank">访问</a>
        </div>
    `;

    // 处理图标加载失败 - 多重备选机制（带超时检测）
    const img = card.querySelector('.site-icon');
    const fallback = card.querySelector('.fallback-icon');
    let currentSourceIndex = 0;
    let loadTimeout = null;

    function showFallbackIcon() {
        console.log(`显示备用图标: ${firstChar}`);
        img.style.display = 'none';
        fallback.style.display = 'flex';
        if (loadTimeout) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
        }
    }

    function tryNextFaviconSource() {
        // 清除之前的超时
        if (loadTimeout) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
        }

        currentSourceIndex++;
        if (currentSourceIndex < faviconSources.length) {
            console.log(`尝试备选图标源 ${currentSourceIndex + 1}: ${faviconSources[currentSourceIndex]}`);

            // 设置新的超时检测（1.5秒）
            loadTimeout = setTimeout(() => {
                console.log(`图标加载超时: ${faviconSources[currentSourceIndex]}`);
                tryNextFaviconSource();
            }, 1500);

            img.src = faviconSources[currentSourceIndex];
        } else {
            // 所有源都失败，显示备用图标
            console.log(`所有图标源都失败，显示备用图标: ${firstChar}`);
            showFallbackIcon();
        }
    }

    function startIconLoading() {
        // 为第一个图标源设置超时检测（1.5秒）
        loadTimeout = setTimeout(() => {
            console.log(`首个图标加载超时: ${faviconSources[0]}`);
            tryNextFaviconSource();
        }, 1500);
    }

    img.addEventListener('error', function() {
        console.log(`图标加载失败: ${this.src}`);
        if (loadTimeout) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
        }
        tryNextFaviconSource();
    });

    img.addEventListener('load', function() {
        // 清除超时
        if (loadTimeout) {
            clearTimeout(loadTimeout);
            loadTimeout = null;
        }

        // 检查是否是默认的空白图标（某些网站返回1x1像素图片）
        if (this.naturalWidth <= 16 && this.naturalHeight <= 16) {
            console.log(`图标太小 (${this.naturalWidth}x${this.naturalHeight})，尝试下一个源`);
            tryNextFaviconSource();
        } else {
            console.log(`图标加载成功: ${this.src} (${this.naturalWidth}x${this.naturalHeight})`);
        }
    });

    // 开始加载图标并启动超时检测
    startIconLoading();

    // 添加点击事件记录点击量
    card.querySelector('.link-btn').addEventListener('click', function(e) {
        const linkId = this.getAttribute('data-id');
        fetch(`/api/stats/click/${linkId}`, { method: 'POST' }).catch(err => {
            console.log('记录点击量失败:', err);
        });
    });

    return card;
}

// 初始化搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchEngine = document.getElementById('search-engine');

    if (!searchInput || !searchBtn || !searchEngine) {
        console.log('搜索元素未找到');
        return;
    }

    // 搜索按钮点击事件
    searchBtn.addEventListener('click', performSearch);

    // 输入框回车事件
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // 搜索引擎切换事件
    searchEngine.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const icon = selectedOption.getAttribute('data-icon');
        const searchIcon = document.querySelector('.search-icon');
        if (icon && searchIcon) {
            searchIcon.textContent = icon;
        }
    });

    // 初始化搜索图标
    const initialOption = searchEngine.options[searchEngine.selectedIndex];
    const initialIcon = initialOption.getAttribute('data-icon');
    const searchIcon = document.querySelector('.search-icon');
    if (initialIcon && searchIcon) {
        searchIcon.textContent = initialIcon;
    }
}

// 执行搜索
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchEngine = document.getElementById('search-engine');
    const query = searchInput.value.trim();

    if (!query) {
        searchInput.focus();
        return;
    }

    const selectedOption = searchEngine.options[searchEngine.selectedIndex];
    const searchUrl = selectedOption.getAttribute('data-url');
    const engineName = selectedOption.textContent;

    // 构建搜索URL
    const fullUrl = searchUrl + encodeURIComponent(query);

    // 在新标签页打开搜索结果
    window.open(fullUrl, '_blank');

    // 记录搜索统计
    console.log(`使用 ${engineName} 搜索: ${query}`);

    // 添加搜索历史记录
    addSearchHistory(engineName, query);

    // 清空搜索框（可选）
    // searchInput.value = '';
}

// 添加搜索历史（本地存储）
function addSearchHistory(engine, query) {
    try {
        let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const searchRecord = {
            engine: engine,
            query: query,
            timestamp: new Date().toISOString()
        };

        // 避免重复记录
        history = history.filter(item => !(item.engine === engine && item.query === query));

        // 添加到历史记录开头
        history.unshift(searchRecord);

        // 只保留最近20条记录
        history = history.slice(0, 20);

        localStorage.setItem('searchHistory', JSON.stringify(history));
    } catch (error) {
        console.log('保存搜索历史失败:', error);
    }
}

// 获取搜索历史
function getSearchHistory() {
    try {
        return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    } catch (error) {
        console.log('获取搜索历史失败:', error);
        return [];
    }
}

// 网站运行时间功能（使用自定义开始时间）
function initRuntimeWithStartTime(startDate) {
    function updateRuntime() {
        const now = new Date();
        const diff = now - startDate;

        // 计算时间差
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // 格式化显示
        let runtimeText = '';
        if (days > 0) {
            runtimeText += `${days}天`;
        }
        if (hours > 0 || days > 0) {
            runtimeText += `${hours}小时`;
        }
        if (minutes > 0 || hours > 0 || days > 0) {
            runtimeText += `${minutes}分钟`;
        }
        runtimeText += `${seconds}秒`;

        // 更新显示
        const runtimeDisplay = document.getElementById('runtime-display');
        if (runtimeDisplay) {
            runtimeDisplay.textContent = runtimeText;
        }
    }

    // 立即更新一次
    updateRuntime();

    // 每秒更新一次
    setInterval(updateRuntime, 1000);
}

// 网站运行时间功能（默认版本）
function initRuntime() {
    // 设置网站启动时间（请根据实际情况修改）
    const startDate = new Date('2024-01-01 00:00:00'); // 网站启动日期
    initRuntimeWithStartTime(startDate);
}

// 获取网站启动时间（可选功能）
function getWebsiteStartDate() {
    // 可以从服务器获取网站实际启动时间
    // 这里使用固定日期作为示例
    return new Date('2024-01-01 00:00:00');
}

// 格式化运行时间显示
function formatRuntime(totalSeconds) {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    let result = '';
    if (days > 0) result += `${days}天`;
    if (hours > 0) result += `${hours}小时`;
    if (minutes > 0) result += `${minutes}分钟`;
    result += `${seconds}秒`;

    return result;
}

// 获取用户IP地址
async function getUserIP() {
    try {
        // 尝试从多个服务获取IP
        const services = [
            'https://api.ipify.org?format=json',
            'https://httpbin.org/ip',
            'https://jsonip.com'
        ];

        for (const service of services) {
            try {
                const response = await fetch(service);
                const data = await response.json();
                return data.ip || data.origin || data.ip;
            } catch (err) {
                console.log(`IP服务 ${service} 失败:`, err);
                continue;
            }
        }

        // 如果所有服务都失败，使用时间戳作为唯一标识
        return 'unknown_' + Date.now();
    } catch (error) {
        console.error('获取IP失败:', error);
        return 'unknown_' + Date.now();
    }
}

// 检查并显示公告
async function checkAndShowAnnouncement() {
    try {
        const userIP = await getUserIP();
        console.log('用户IP:', userIP);

        const response = await fetch(`/admin/announcement/check/${userIP}`);
        const data = await response.json();

        if (data.shouldShow && data.announcement) {
            showAnnouncement(data.announcement, userIP);
        }
    } catch (error) {
        console.error('检查公告失败:', error);
    }
}

// 显示公告弹窗
function showAnnouncement(announcement, userIP) {
    // 创建弹窗HTML
    const overlay = document.createElement('div');
    overlay.className = 'announcement-overlay';
    overlay.innerHTML = `
        <div class="announcement-modal">
            <div class="announcement-header">
                <h3 class="announcement-title">${announcement.title}</h3>
                <button class="announcement-close" onclick="closeAnnouncement()">&times;</button>
            </div>
            <div class="announcement-content">${announcement.content}</div>
            <div class="announcement-footer">
                <span class="announcement-countdown">
                    <span id="countdown-text">${announcement.countdown}</span> 秒后自动关闭
                </span>
                <button class="announcement-btn" onclick="closeAnnouncement()">我知道了</button>
            </div>
        </div>
    `;

    // 添加到页面
    document.body.appendChild(overlay);

    // 启动倒计时
    let countdown = announcement.countdown;
    const countdownEl = document.getElementById('countdown-text');

    const timer = setInterval(() => {
        countdown--;
        if (countdownEl) {
            countdownEl.textContent = countdown;
        }

        if (countdown <= 0) {
            clearInterval(timer);
            closeAnnouncement();
        }
    }, 1000);

    // 保存定时器引用以便手动关闭时清除
    overlay.dataset.timer = timer;
    overlay.dataset.userIP = userIP;

    // 点击遮罩层关闭
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeAnnouncement();
        }
    });

    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAnnouncement();
        }
    });
}

// 关闭公告弹窗
function closeAnnouncement() {
    const overlay = document.querySelector('.announcement-overlay');
    if (!overlay) return;

    // 清除定时器
    const timer = overlay.dataset.timer;
    if (timer) {
        clearInterval(parseInt(timer));
    }

    // 记录用户已查看
    const userIP = overlay.dataset.userIP;
    if (userIP) {
        fetch('/admin/announcement/viewed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip: userIP })
        }).catch(err => {
            console.log('记录公告查看失败:', err);
        });
    }

    // 移除弹窗
    overlay.remove();
}

// 主题切换功能
function initTheme() {
    // 从localStorage获取保存的主题设置
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 如果有保存的主题设置，使用保存的；否则根据系统偏好设置
    const shouldUseDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

    if (shouldUseDark) {
        document.body.classList.add('dark-theme');
        updateThemeButton(true);
    } else {
        document.body.classList.remove('dark-theme');
        updateThemeButton(false);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');

    if (isDark) {
        // 切换到亮色主题
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        updateThemeButton(false);

        // 显示切换提示
        showThemeNotification('已切换到亮色模式 ☀️');
    } else {
        // 切换到暗色主题
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeButton(true);

        // 显示切换提示
        showThemeNotification('已切换到暗色模式 🌙');
    }
}

function updateThemeButton(isDark) {
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    if (isDark) {
        themeIcon.textContent = '☀️';
        themeText.textContent = '亮色';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = '暗色';
    }
}

function showThemeNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #3b82f6;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;

    // 添加到页面
    document.body.appendChild(notification);

    // 显示动画
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    // 3秒后隐藏并移除
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    // 只有在用户没有手动设置主题时才跟随系统
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === null) {
        if (e.matches) {
            document.body.classList.add('dark-theme');
            updateThemeButton(true);
        } else {
            document.body.classList.remove('dark-theme');
            updateThemeButton(false);
        }
    }
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题
    initTheme();

    // 先加载站点设置，再加载其他数据
    fetchSiteSettings();
    fetchData();
    initSearch();

    // 检查并显示公告
    setTimeout(checkAndShowAnnouncement, 1000); // 延迟1秒显示公告，确保页面加载完成

    console.log('页面初始化完成，点击Logo可刷新数据');
});
