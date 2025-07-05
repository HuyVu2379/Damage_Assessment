import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Animated,
    Dimensions,
    Alert
} from 'react-native';
import { IconButton, Divider, List } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';
import { chatStorage } from '../services/chatStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

const SidebarMenu = ({ visible, onClose, onNewChat, onLoadConversation, currentMessages, theme }) => {
    const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));
    const [chatHistory, setChatHistory] = useState([]);

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
    }, [visible]);

    const loadChatHistory = async () => {
        try {
            const history = await chatStorage.getChatHistory();
            setChatHistory(history);
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
        }
    };

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

    const handleDeleteChat = async (chatId) => {
        Alert.alert(
            'Xóa cuộc trò chuyện',
            'Bạn có chắc chắn muốn xóa cuộc trò chuyện này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await chatStorage.deleteChat(chatId);
                            loadChatHistory();
                        } catch (error) {
                            // Loại bỏ console.error để giảm lag terminal
                        }
                    },
                },
            ]
        );
    };

    const formatChatTitle = (messages) => {
        if (!messages || messages.length === 0) return 'Cuộc trò chuyện trống';

        const firstUserMessage = messages.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            return firstUserMessage.content.length > 40
                ? firstUserMessage.content.substring(0, 40) + '...'
                : firstUserMessage.content;
        }
        return 'Cuộc trò chuyện mới';
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hôm nay';
        if (diffDays === 2) return 'Hôm qua';
        if (diffDays <= 7) return `${diffDays - 1} ngày trước`;
        if (diffDays <= 30) return `${Math.ceil((diffDays - 1) / 7)} tuần trước`;
        return `${Math.ceil((diffDays - 1) / 30)} tháng trước`;
    };

    const groupChatsByDate = (chats) => {
        // Sắp xếp chat từ mới nhất đến cũ nhất
        const sortedChats = chats.sort((a, b) => b.timestamp - a.timestamp);

        const groups = {};
        sortedChats.forEach(chat => {
            const dateGroup = formatDate(chat.timestamp);
            if (!groups[dateGroup]) {
                groups[dateGroup] = [];
            }
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
                            // Sắp xếp các nhóm ngày theo thứ tự ưu tiên
                            Object.entries(chatGroups)
                                .sort(([dateGroupA], [dateGroupB]) => {
                                    const dateOrder = ['Hôm nay', 'Hôm qua'];
                                    const indexA = dateOrder.indexOf(dateGroupA);
                                    const indexB = dateOrder.indexOf(dateGroupB);

                                    // Nếu cả hai đều trong danh sách ưu tiên
                                    if (indexA !== -1 && indexB !== -1) {
                                        return indexA - indexB;
                                    }
                                    // Nếu chỉ A trong danh sách ưu tiên
                                    if (indexA !== -1) return -1;
                                    // Nếu chỉ B trong danh sách ưu tiên  
                                    if (indexB !== -1) return 1;
                                    // Nếu cả hai đều không trong danh sách ưu tiên, sắp xếp theo thứ tự tự nhiên
                                    return dateGroupA.localeCompare(dateGroupB);
                                })
                                .map(([dateGroup, chats]) => (
                                    <View key={dateGroup}>
                                        <Text style={[styles.dateHeader, { color: theme.colors.onSurfaceVariant }]}>
                                            {dateGroup}
                                        </Text>
                                        {chats.map((chat) => (
                                            <TouchableOpacity
                                                key={chat.id}
                                                style={[
                                                    styles.chatItem,
                                                    { backgroundColor: theme.colors.surfaceVariant }
                                                ]}
                                                onPress={() => handleLoadChat(chat)}
                                                onLongPress={() => handleDeleteChat(chat.id)}
                                            >
                                                <View style={styles.chatItemContent}>
                                                    <IconButton
                                                        icon="message-text"
                                                        size={16}
                                                        iconColor={theme.colors.onSurfaceVariant}
                                                    />
                                                    <Text
                                                        style={[styles.chatTitle, { color: theme.colors.onSurface }]}
                                                        numberOfLines={2}
                                                    >
                                                        {formatChatTitle(chat.messages)}
                                                    </Text>
                                                </View>
                                                <IconButton
                                                    icon="delete-outline"
                                                    size={16}
                                                    iconColor={theme.colors.error}
                                                    onPress={() => handleDeleteChat(chat.id)}
                                                />
                                            </TouchableOpacity>
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

                            <TouchableOpacity style={styles.footerItem}>
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
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 70
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
        height: '100%',
        shadowColor: '#000',
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
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        textTransform: 'uppercase',
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(8),
        marginVertical: verticalScale(2),
        borderRadius: 8,
    },
    chatItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatTitle: {
        fontSize: moderateScale(13),
        marginLeft: scale(8),
        flex: 1,
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
