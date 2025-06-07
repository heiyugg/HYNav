const mongoose = require('mongoose');

const SiteSettingSchema = new mongoose.Schema({
    siteName: { type: String, default: '我的导航网站' },
    logo: { type: String, default: '' }, // logo URL
    icpNumber: { type: String, default: '' }, // 备案号
    policeNumber: { type: String, default: '' }, // 公安备案号
    startTime: { type: Date, default: Date.now }, // 网站运行开始时间
    // 公告相关字段
    announcement: {
        enabled: { type: Boolean, default: false }, // 是否启用公告
        title: { type: String, default: '' }, // 公告标题
        content: { type: String, default: '' }, // 公告内容
        countdown: { type: Number, default: 10 }, // 倒计时秒数
        showOnce: { type: Boolean, default: true }, // 是否每个IP只显示一次
        createdAt: { type: Date, default: Date.now } // 公告创建时间
    },
    updatedAt: { type: Date, default: Date.now }
});

// 确保只有一个设置文档
SiteSettingSchema.statics.getSetting = async function() {
    let setting = await this.findOne();
    if (!setting) {
        setting = await this.create({});
    }
    return setting;
};

SiteSettingSchema.statics.updateSetting = async function(data) {
    let setting = await this.findOne();
    if (!setting) {
        setting = await this.create(data);
    } else {
        Object.assign(setting, data);
        setting.updatedAt = new Date();
        await setting.save();
    }
    return setting;
};

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
