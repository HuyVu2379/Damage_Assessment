import * as FileSystem from 'expo-file-system';
/**
 * Chuyển đổi ảnh sang Base64
 * @param {string} uri URI của ảnh
 * @returns {Promise<string>} Ảnh đã được encode thành Base64
 */
export const convertImageToBase64 = async (uri) => {
    try {
        console.log('Đang chuyển đổi ảnh sang Base64:', uri);
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        console.log('Chuyển đổi Base64 thành công');
        return base64;
    } catch (error) {
        console.error('Lỗi khi chuyển đổi ảnh sang Base64:', error);
        throw error;
    }
};
