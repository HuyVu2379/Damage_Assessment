const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Thêm cấu hình để tránh xung đột
config.resolver.platforms = ['native', 'android', 'ios'];

// Tối ưu hóa cho Expo Go
config.transformer.minifierConfig = {
    keep_fnames: true,
    mangle: {
        keep_fnames: true,
    },
};

module.exports = config;
