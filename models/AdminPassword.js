const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 密码文件路径
const PASSWORD_FILE = path.join(__dirname, '../data/admin_password.json');

// 确保data目录存在
const dataDir = path.dirname(PASSWORD_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 简单的密码加密函数（实际项目中应该使用bcrypt）
function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'salt_key_2024').digest('hex');
}

// 验证密码
function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// 获取当前密码
function getCurrentPassword() {
    try {
        if (fs.existsSync(PASSWORD_FILE)) {
            const data = fs.readFileSync(PASSWORD_FILE, 'utf8');
            const passwordData = JSON.parse(data);
            return passwordData.hashedPassword;
        }
    } catch (error) {
        console.error('读取密码文件失败:', error);
    }
    
    // 如果文件不存在或读取失败，返回默认密码的哈希值
    const defaultPassword = 'admin123';
    const hashedDefault = hashPassword(defaultPassword);
    
    // 保存默认密码到文件
    savePassword(defaultPassword);
    
    return hashedDefault;
}

// 保存密码
function savePassword(newPassword) {
    try {
        const hashedPassword = hashPassword(newPassword);
        const passwordData = {
            hashedPassword: hashedPassword,
            updatedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        fs.writeFileSync(PASSWORD_FILE, JSON.stringify(passwordData, null, 2), 'utf8');
        console.log('密码已保存到文件');
        return true;
    } catch (error) {
        console.error('保存密码失败:', error);
        return false;
    }
}

// 验证当前密码
function validateCurrentPassword(inputPassword) {
    const currentHashedPassword = getCurrentPassword();
    return verifyPassword(inputPassword, currentHashedPassword);
}

// 修改密码
function changePassword(currentPassword, newPassword) {
    // 验证当前密码
    if (!validateCurrentPassword(currentPassword)) {
        throw new Error('当前密码错误');
    }
    
    // 检查新密码长度
    if (newPassword.length < 6) {
        throw new Error('新密码长度至少6位');
    }
    
    // 检查新密码是否与当前密码相同
    if (currentPassword === newPassword) {
        throw new Error('新密码不能与当前密码相同');
    }
    
    // 保存新密码
    if (savePassword(newPassword)) {
        return {
            success: true,
            message: '密码修改成功'
        };
    } else {
        throw new Error('密码保存失败');
    }
}

// 初始化密码文件（如果不存在）
function initializePassword() {
    if (!fs.existsSync(PASSWORD_FILE)) {
        console.log('初始化默认密码文件...');
        savePassword('admin123');
    }
}

// 获取当前密码数据（用于备份）
function getCurrentPasswordData() {
    try {
        if (fs.existsSync(PASSWORD_FILE)) {
            const data = fs.readFileSync(PASSWORD_FILE, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('读取密码数据失败:', error);
        return null;
    }
}

module.exports = {
    getCurrentPassword,
    savePassword,
    validateCurrentPassword,
    changePassword,
    initializePassword,
    hashPassword,
    verifyPassword,
    getCurrentPasswordData
};
