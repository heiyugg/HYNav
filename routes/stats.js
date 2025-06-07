const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const Stats = require('../models/Stats');
const Category = require('../models/Category');

// 记录网站访问
router.post('/visit', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = new Stats({ visits: 0 });
        }
        stats.visits += 1;
        stats.lastUpdated = new Date();
        await stats.save();
        res.status(200).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 记录链接点击
router.post('/click/:id', async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        if (!link) return res.status(404).json({ message: '链接不存在' });
        
        link.clicks += 1;
        await link.save();
        res.status(200).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 获取统计数据
router.get('/', async (req, res) => {
    try {
        const stats = await Stats.findOne() || { visits: 0 };
        const categoryCount = await Category.countDocuments();
        const linkCount = await Link.countDocuments();
        
        res.json({
            visits: stats.visits,
            categories: categoryCount,
            links: linkCount
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

