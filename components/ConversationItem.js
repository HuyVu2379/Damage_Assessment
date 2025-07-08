import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Menu, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { moderateScale } from '../utils/scaling';
import RenameModal from './RenameModal'; // <<<--- 1. Import Modal mới

const ConversationItem = ({ conversation, onLoad, onRename, onDelete }) => {
    const theme = useTheme();
    const [menuVisible, setMenuVisible] = useState(false);
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false); // <<<--- 2. Thêm state để quản lý modal

    const openMenu = useCallback(() => setMenuVisible(true), []);
    const closeMenu = useCallback(() => setMenuVisible(false), []);

    const handleRenamePress = () => {
        closeMenu(); // Đóng menu pop-up trước
        // Kiểm tra nền tảng để hiển thị UI phù hợp
        if (Platform.OS === 'ios') {
            Alert.prompt(
                'Đổi tên cuộc trò chuyện',
                'Nhập tên mới:',
                (newName) => {
                    if (newName && newName.trim()) {
                        onRename(conversation.id, newName.trim());
                    }
                },
                'plain-text',
                conversation.name || ''
            );
        } else {
            // Trên Android, mở modal tùy chỉnh
            setIsRenameModalVisible(true);
        }
    };

    const handleDeletePress = () => {
        closeMenu();
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?`,
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => onDelete(conversation.id) },
            ]
        );
    };

    // Hàm này sẽ được gọi khi người dùng nhấn "Đổi tên" trong RenameModal
    const handleSaveRename = (newName) => {
        onRename(conversation.id, newName);
        setIsRenameModalVisible(false); // Đóng modal sau khi lưu
    };

    const formatChatTitle = (messages, name) => {
        if (name) return name;
        const firstUserMessage = messages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            let content = firstUserMessage.content;

            // Xử lý tin nhắn có ảnh
            if (firstUserMessage.imageUri) {
                // Nếu chỉ có ảnh không có text
                if (content === '[Đã gửi 1 ảnh]') {
                    content = 'Đã gửi 1 ảnh';
                } else {
                    // Nếu có cả ảnh và text, loại bỏ prefix [Đã gửi 1 ảnh]
                    content = content.replace(/^\[Đã gửi 1 ảnh\]\s*/, '🖼️ ');
                }
            }

            return content.length > 40 ? content.substring(0, 40) + '...' : content;
        }
        return 'Cuộc trò chuyện mới';
    };

    return (
        // Bọc trong View để Modal có thể render đúng cách
        <View>
            <TouchableOpacity style={styles.container} onPress={() => onLoad(conversation)}>
                <View style={styles.leftContent}>
                    <Icon name="chat-outline" size={moderateScale(20)} color="#555" />
                    <Text style={styles.title} numberOfLines={1}>
                        {formatChatTitle(conversation.messages, conversation.name)}
                    </Text>
                </View>
                <Menu
                    visible={menuVisible}
                    onDismiss={closeMenu}
                    anchor={
                        <TouchableOpacity onPress={openMenu} style={styles.menuAnchor}>
                            <Icon name="dots-vertical" size={moderateScale(22)} color="#555" />
                        </TouchableOpacity>
                    }
                >
                    <Menu.Item onPress={handleRenamePress} title="Đổi tên" leadingIcon="pencil-outline" />
                    <Menu.Item onPress={handleDeletePress} title="Xóa" leadingIcon="delete-outline" />
                </Menu>
            </TouchableOpacity>

            {/* 3. Render RenameModal và truyền các props cần thiết */}
            <RenameModal
                visible={isRenameModalVisible}
                onClose={() => setIsRenameModalVisible(false)}
                onSave={handleSaveRename}
                initialName={conversation.name || formatChatTitle(conversation.messages)}
            />
        </View>
    );
};

// Styles không đổi...
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginVertical: 4,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    title: {
        marginLeft: 12,
        fontSize: moderateScale(14),
        color: '#333',
        flex: 1,
    },
    menuAnchor: {
        padding: 5,
        borderRadius: 20,
    },
});

export default ConversationItem;