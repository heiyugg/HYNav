const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Link = require('../models/Link');

// 获取所有分类及其链接
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1 });
        const result = [];
        
        for (const category of categories) {
            const links = await Link.find({ categoryId: category._id });
            result.push({
                id: category._id,
                name: category.name,
                links: links
            });
        }
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 获取数据更新时间（用于检查是否需要刷新）
router.get('/last-updated', async (req, res) => {
    try {
        const Category = require('../models/Category');
        const Link = require('../models/Link');

        // 获取最新的分类和链接更新时间
        const [latestCategory, latestLink] = await Promise.all([
            Category.findOne().sort({ updatedAt: -1 }).select('updatedAt'),
            Link.findOne().sort({ updatedAt: -1 }).select('updatedAt')
        ]);

        // 找出最新的更新时间
        let lastUpdated = new Date('2024-01-01'); // 默认时间

        if (latestCategory && latestCategory.updatedAt) {
            lastUpdated = new Date(Math.max(lastUpdated.getTime(), latestCategory.updatedAt.getTime()));
        }

        if (latestLink && latestLink.updatedAt) {
            lastUpdated = new Date(Math.max(lastUpdated.getTime(), latestLink.updatedAt.getTime()));
        }

        res.json({
            lastUpdated: lastUpdated.toISOString(),
            timestamp: lastUpdated.getTime()
        });
    } catch (err) {
        // 如果数据库操作失败，返回当前时间
        const now = new Date();
        res.json({
            lastUpdated: now.toISOString(),
            timestamp: now.getTime()
        });
    }
});

module.exports = router;
