import { DefaultTheme } from 'react-native-paper';
import { moderateScale } from './scaling';

export const theme = {
    ...DefaultTheme,
    roundness: moderateScale(12),
    colors: {
        ...DefaultTheme.colors,
        // Màu chủ đạo: Vàng (#FFD700)
        primary: '#FFD700',
        // Màu phụ: Đỏ/cam đậm cho CTA
        accent: '#FF4500', 
        // Màu nền chính: Trắng
        background: '#FFFFFF',
        // Màu nền nhạt: Vàng nhạt
        surface: '#FFFEF7',
        // Màu text: Đen đậm cho dễ đọc
        text: '#1A1A1A',
        // Màu placeholder: Xám
        placeholder: '#666666',
        // Màu viền: Vàng
        outline: '#FFD700',
        // Màu disabled: Xám nhạt
        disabled: '#CCCCCC',
        // Màu error: Đỏ
        error: '#D32F2F',
        // Màu success: Xanh lá
        success: '#4CAF50',
        // Màu warning: Cam
        warning: '#FF9800',
        // Màu header: Vàng với viền
        header: '#FFD700',
        headerText: '#000000',
        // Màu bubble chat với contrast tốt hơn
        userBubble: '#FFD700',
        aiBubble: '#F8F9FA',
        userText: '#000000',
        aiText: '#1A1A1A',
        // Màu icon tối hơn cho dễ nhìn
        iconPrimary: '#B8860B', // Vàng đậm hơn
        iconSecondary: '#4A4A4A', // Xám đậm
    },
};
