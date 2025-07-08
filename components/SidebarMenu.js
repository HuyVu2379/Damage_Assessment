// File: components/SidebarMenu.js

import React, { useState, useEffect, useCallback } from 'react'; // *** Đã có sẵn useCallback ***
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Animated,
    Dimensions,
    Alert,
    Platform,
} from 'react-native';
import { IconButton, Divider, Provider as PaperProvider, useTheme } from 'react-native-paper'; // Thêm useTheme nếu ConversationItem cần
import { moderateScale, verticalScale, scale } from '../utils/scaling';
import { chatStorage } from '../services/chatStorage';
import ConversationItem from './ConversationItem';
import HelpModal from './HelpModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

const SidebarMenu = ({ visible, onClose, onNewChat, onLoadConversation, theme }) => {
    const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));
    const [chatHistory, setChatHistory] = useState([]);
    const [helpModalVisible, setHelpModalVisible] = useState(false);

    // *** BỌC HÀM NÀY BẰNG useCallback ĐỂ TRÁNH TẠO LẠI KHÔNG CẦN THIẾT ***
    const loadChatHistory = useCallback(async () => {
        try {
            const history = await chatStorage.getChatHistory();
            setChatHistory(history);
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }, []); // Mảng phụ thuộc rỗng vì hàm này không dùng props/state nào

    // *** CẬP NHẬT MẢNG PHỤ THUỘC CỦA useEffect ***
    useEffect(() => {
        if (visible) {
            loadChatHistory();
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -SIDEBAR_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, loadChatHistory, slideAnim]); // Thêm 'loadChatHistory' và 'slideAnim'

    const handleNewChat = () => {
        Alert.alert(
            'Cuộc trò chuyện mới',
            'Bạn có muốn bắt đầu cuộc trò chuyện mới?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Bắt đầu mới',
                    onPress: () => {
                        onNewChat();
                        onClose();
                    },
                },
            ]
        );
    };

    const handleLoadChat = (chatData) => {
        onLoadConversation(chatData.messages);
        onClose();
    };

    const handleRenameChat = async (chatId, newName) => {
        try {
            const history = await chatStorage.getChatHistory();
            const updatedHistory = history.map(chat =>
                chat.id === chatId ? { ...chat, name: newName, timestamp: Date.now() } : chat
            );

            const success = await chatStorage.saveChatHistory(updatedHistory);
            if (success) {
                loadChatHistory();
            } else {
                Alert.alert('Lỗi', 'Không thể lưu tên mới vào bộ nhớ.');
            }
        } catch (error) {
            console.error('Error renaming chat:', error);
            Alert.alert('Lỗi', 'Đã xảy ra sự cố khi đổi tên cuộc trò chuyện.');
        }
    };

    const handleDeleteChat = async (chatId) => {
        try {
            await chatStorage.deleteChat(chatId);
            loadChatHistory();
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) return 'Hôm nay';
        if (diffDays <= 2) return 'Hôm qua';
        if (diffDays <= 7) return `${diffDays} ngày trước`;
        const weeks = Math.ceil(diffDays / 7);
        if (weeks <= 4) return `${weeks} tuần trước`;
        const months = Math.ceil(diffDays / 30);
        return `${months} tháng trước`;
    };

    const groupChatsByDate = (chats) => {
        const sortedChats = chats.sort((a, b) => b.timestamp - a.timestamp);
        const groups = {};
        sortedChats.forEach(chat => {
            const dateGroup = formatDate(chat.timestamp);
            if (!groups[dateGroup]) groups[dateGroup] = [];
            groups[dateGroup].push(chat);
        });
        return groups;
    };

    const chatGroups = groupChatsByDate(chatHistory);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <PaperProvider theme={theme}>
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.sidebar,
                            {
                                transform: [{ translateX: slideAnim }],
                                backgroundColor: theme.colors.surface,
                            }
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
                                <IconButton
                                    icon="plus"
                                    size={20}
                                    iconColor={theme.colors.onSurface}
                                />
                                <Text style={[styles.newChatText, { color: theme.colors.onSurface }]}>
                                    Cuộc trò chuyện mới
                                </Text>
                            </TouchableOpacity>
                            <IconButton
                                icon="close"
                                size={24}
                                onPress={onClose}
                                iconColor={theme.colors.onSurface}
                            />
                        </View>

                        <Divider style={{ backgroundColor: theme.colors.outline }} />

                        {/* Chat History */}
                        <ScrollView style={styles.chatList}>
                            {Object.keys(chatGroups).length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                                        Chưa có cuộc trò chuyện nào
                                    </Text>
                                </View>
                            ) : (
                                Object.entries(chatGroups)
                                    .map(([dateGroup, chats]) => (
                                        <View key={dateGroup}>
                                            <Text style={[styles.dateHeader, { color: theme.colors.onSurfaceVariant }]}>
                                                {dateGroup}
                                            </Text>
                                            {chats.map((chat) => (
                                                <ConversationItem
                                                    key={chat.id}
                                                    conversation={chat}
                                                    onLoad={() => handleLoadChat(chat)}
                                                    onRename={handleRenameChat}
                                                    onDelete={handleDeleteChat}
                                                />
                                            ))}
                                        </View>
                                    ))
                            )}
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Divider style={{ backgroundColor: theme.colors.outline }} />
                            <View style={styles.footerContent}>
                                <TouchableOpacity style={styles.footerItem}>
                                    <IconButton
                                        icon="cog"
                                        size={20}
                                        iconColor={theme.colors.onSurfaceVariant}
                                    />
                                    <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
                                        Cài đặt
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.footerItem}
                                    onPress={() => setHelpModalVisible(true)}
                                >
                                    <IconButton
                                        icon="help-circle"
                                        size={20}
                                        iconColor={theme.colors.onSurfaceVariant}
                                    />
                                    <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
                                        Trợ giúp
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>

                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </View>
            </PaperProvider>
            
            <HelpModal 
                visible={helpModalVisible}
                onClose={() => setHelpModalVisible(false)}
                theme={theme}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: Platform.OS === 'android' ? 25 : 50,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
        height: '100%',
        shadowColor: '#000',
        elevation: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(10),
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    newChatText: {
        fontSize: moderateScale(14),
        fontWeight: '500',
        marginLeft: scale(8),
    },
    chatList: {
        flex: 1,
        paddingHorizontal: scale(10),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(50),
    },
    emptyText: {
        fontSize: moderateScale(14),
        textAlign: 'center',
    },
    dateHeader: {
        fontSize: moderateScale(12),
        fontWeight: '600',
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(8),
        paddingHorizontal: scale(4),
        textTransform: 'capitalize',
        color: '#666'
    },
    footer: {
        paddingVertical: verticalScale(10),
    },
    footerContent: {
        paddingHorizontal: scale(10),
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
    },
    footerText: {
        fontSize: moderateScale(14),
        marginLeft: scale(8),
    },
});

export default SidebarMenu;