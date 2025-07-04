import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    FlatList,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import {
    Text,
    Button,
    TextInput,
    Card,
    Title,
    Paragraph,
    IconButton,
    Divider,
} from 'react-native-paper';
import { chatStorage } from '../services/chatStorage';
import { verticalScale, scale } from '../utils/scaling';

const ChatHistoryModal = ({ visible, onClose, onLoadConversation, currentMessages, theme }) => {
    const [activeTab, setActiveTab] = useState('save');
    const [conversationName, setConversationName] = useState('');
    const [savedConversations, setSavedConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'messages'
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [viewDialogVisible, setViewDialogVisible] = useState(false);

    useEffect(() => {
        console.log('useEffect triggered:', { visible, activeTab, sortBy });
        if (visible && activeTab === 'load') {
            loadSavedConversations();
        }
    }, [visible, activeTab, sortBy, loadSavedConversations]);

    const loadSavedConversations = useCallback(async () => {
        console.log('Loading saved conversations...');
        setIsLoading(true);
        const conversations = await chatStorage.getSavedConversations();
        console.log('Loaded conversations:', conversations);
        let sortedConversations = [...conversations];

        // Sắp xếp theo loại
        switch (sortBy) {
            case 'name':
                sortedConversations.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'messages':
                sortedConversations.sort((a, b) => b.messages.length - a.messages.length);
                break;
            default: // 'date'
                sortedConversations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }

        setSavedConversations(sortedConversations);
        console.log('Set conversations:', sortedConversations);
        setIsLoading(false);
    }, [sortBy]);

    const handleSaveConversation = useCallback(async () => {
        if (!conversationName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên cuộc trò chuyện');
            return;
        }

        if (currentMessages.length <= 1) {
            Alert.alert('Lỗi', 'Không có cuộc trò chuyện nào để lưu');
            return;
        }

        setIsLoading(true);
        const success = await chatStorage.saveConversation(conversationName.trim(), currentMessages);
        setIsLoading(false);

        if (success) {
            Alert.alert('Thành công', 'Đã lưu cuộc trò chuyện!');
            setConversationName('');
            onClose();
        } else {
            Alert.alert('Lỗi', 'Không thể lưu cuộc trò chuyện');
        }
    }, [conversationName, currentMessages, onClose]);

    const handleLoadConversation = useCallback(async (conversationId) => {
        setIsLoading(true);
        const messages = await chatStorage.loadConversation(conversationId);
        setIsLoading(false);

        if (messages) {
            onLoadConversation(messages);
            onClose();
        } else {
            Alert.alert('Lỗi', 'Không thể tải cuộc trò chuyện');
        }
    }, [onLoadConversation, onClose]);

    // Function để tạo cuộc trò chuyện mẫu cho test
    const createSampleConversation = useCallback(async () => {
        const sampleMessages = [
            { role: 'system', content: 'Bạn là một trợ lý AI hữu ích.' },
            { role: 'user', content: 'Xin chào!' },
            { role: 'assistant', content: 'Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?' },
            { role: 'user', content: 'Bạn có thể giúp tôi học tiếng Anh không?' },
            { role: 'assistant', content: 'Tất nhiên! Tôi rất vui được giúp bạn học tiếng Anh. Bạn muốn bắt đầu từ đâu?' },
        ];

        const success = await chatStorage.saveConversation('Cuộc trò chuyện mẫu ' + Date.now(), sampleMessages);
        if (success) {
            Alert.alert('Thành công', 'Đã tạo cuộc trò chuyện mẫu!');
            if (activeTab === 'load') {
                loadSavedConversations();
            }
        } else {
            Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện mẫu');
        }
    }, [activeTab, loadSavedConversations]);

    const handleDeleteConversation = (conversationId, conversationName) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa cuộc trò chuyện "${conversationName}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await chatStorage.deleteConversation(conversationId);
                        if (success) {
                            loadSavedConversations();
                        } else {
                            Alert.alert('Lỗi', 'Không thể xóa cuộc trò chuyện');
                        }
                    },
                },
            ]
        );
    };

    const handleClearAllConversations = () => {
        Alert.alert(
            'Xác nhận xóa tất cả',
            `Bạn có chắc chắn muốn xóa tất cả ${savedConversations.length} cuộc trò chuyện? Hành động này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa tất cả',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        // Xóa từng cuộc trò chuyện
                        for (const conversation of savedConversations) {
                            await chatStorage.deleteConversation(conversation.id);
                        }
                        setIsLoading(false);
                        loadSavedConversations();
                        Alert.alert('Thành công', 'Đã xóa tất cả cuộc trò chuyện');
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportConversation = (conversation) => {
        const exportText = `=== ${conversation.name} ===\nNgày tạo: ${formatDate(conversation.createdAt)}\nSố tin nhắn: ${conversation.messages.length - 1}\n\n--- Nội dung cuộc trò chuyện ---\n\n${conversation.messages
            .filter(msg => msg.role !== 'system')
            .map(msg => `${msg.role === 'user' ? 'Người dùng' : 'AI'}: ${msg.content}`)
            .join('\n\n')}\n\n=== Kết thúc ===`;

        // Hiển thị nội dung xuất qua Alert và console
        Alert.alert(
            `Xuất: ${conversation.name}`,
            `Đã tạo nội dung xuất! Nội dung đã được xuất ra console.`,
            [
                { text: 'Đóng', style: 'cancel' },
                {
                    text: 'Xem nội dung',
                    onPress: () => {
                        console.log('=== EXPORTED CONVERSATION ===');
                        console.log(exportText);
                        console.log('=== END EXPORTED CONVERSATION ===');
                        Alert.alert('Thành công', 'Đã xuất nội dung cuộc trò chuyện! Kiểm tra console để xem chi tiết.');
                    }
                }
            ]
        );
    };

    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const handleContextMenu = (item, event) => {
        setSelectedConversation(item);
        setContextMenuVisible(true);
    };

    const handleMenuAction = (action) => {
        setContextMenuVisible(false);
        if (!selectedConversation) return;

        switch (action) {
            case 'view':
                handleViewConversation(selectedConversation);
                break;
            case 'rename':
                // TODO: Implement rename functionality
                Alert.alert('Thông báo', 'Chức năng đổi tên sẽ được thêm trong phiên bản sau');
                break;
            case 'export':
                exportConversation(selectedConversation);
                break;
            case 'delete':
                handleDeleteConversation(selectedConversation.id, selectedConversation.name);
                break;
        }
    };

    const handleViewConversation = (conversation) => {
        setSelectedConversation(conversation);
        setViewDialogVisible(true);
    };

    const renderContextMenu = () => {
        if (!contextMenuVisible) return null;

        return (
            <TouchableOpacity
                style={styles.contextMenuOverlay}
                activeOpacity={1}
                onPress={() => setContextMenuVisible(false)}
            >
                <View style={styles.contextMenu}>
                    <TouchableOpacity
                        style={styles.contextMenuItem}
                        onPress={() => handleMenuAction('view')}
                    >
                        <Text style={styles.contextMenuText}>👁️ Xem chi tiết</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.contextMenuItem}
                        onPress={() => handleMenuAction('rename')}
                    >
                        <Text style={styles.contextMenuText}>✏️ Đổi tên</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.contextMenuItem}
                        onPress={() => handleMenuAction('export')}
                    >
                        <Text style={styles.contextMenuText}>📤 Xuất</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.contextMenuItem, styles.deleteMenuItem]}
                        onPress={() => handleMenuAction('delete')}
                    >
                        <Text style={[styles.contextMenuText, styles.deleteText]}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const renderMessagePreview = (message, index) => {
        if (message.role === 'system') return null;

        const isUser = message.role === 'user';
        const maxLength = 100;
        const content = message.content.length > maxLength
            ? `${message.content.substring(0, maxLength)}...`
            : message.content;

        return (
            <View key={index} style={[
                styles.messagePreview,
                isUser ? styles.userMessagePreview : styles.aiMessagePreview
            ]}>
                <Text style={[
                    styles.messageSender,
                    { color: isUser ? '#007AFF' : '#34C759' }
                ]}>
                    {isUser ? 'Bạn' : 'AI'}
                </Text>
                <Text style={styles.messageContent}>{content}</Text>
            </View>
        );
    };

    const renderConversationItem = ({ item }) => {
        const firstUserMessage = item.messages.find(msg => msg.role === 'user')?.content || '';
        const truncatedMessage = firstUserMessage.length > 60
            ? `${firstUserMessage.substring(0, 60)}...`
            : firstUserMessage;

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handleLoadConversation(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.conversationContent}>
                    <View style={styles.conversationIcon}>
                        <Text style={styles.iconText}>💬</Text>
                    </View>
                    <View style={styles.conversationDetails}>
                        <Text style={styles.conversationTitle} numberOfLines={1}>
                            {truncatedMessage || item.name}
                        </Text>
                        <Text style={styles.conversationDate}>
                            {formatDate(item.createdAt)}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.conversationMenu}
                    onPress={() => handleContextMenu(item)}
                >
                    <View style={styles.menuButton}>
                        <Text style={styles.menuDots}>⋯</Text>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    // Lọc cuộc trò chuyện theo từ khóa tìm kiếm
    const filteredConversations = savedConversations.filter(conversation =>
        conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sắp xếp cuộc trò chuyện đã lọc
    const sortedConversations = [...filteredConversations].sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'messages') {
            return b.messages.length - a.messages.length;
        }
        return 0;
    });

    console.log('Render state:', {
        savedConversations: savedConversations.length,
        filteredConversations: filteredConversations.length,
        sortedConversations: sortedConversations.length,
        searchQuery,
        sortBy,
        activeTab,
        visible
    });

    // Render modal xem chi tiết
    const renderViewModal = () => {
        if (!viewDialogVisible || !selectedConversation) return null;

        const handleModalPress = () => {
            setViewDialogVisible(false);
        };

        const handleContentPress = (e) => {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }
        };

        return (
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={handleModalPress}
                />
                <View
                    style={[styles.viewModalContainer, { backgroundColor: theme.colors.surface }]}
                >
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>
                            {selectedConversation.name}
                        </Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setViewDialogVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        <View style={styles.conversationDetails}>
                            <Text style={styles.detailLabel}>Ngày tạo:</Text>
                            <Text style={styles.detailValue}>
                                {formatDate(selectedConversation.createdAt)}
                            </Text>
                        </View>
                        <View style={styles.conversationDetails}>
                            <Text style={styles.detailLabel}>Số tin nhắn:</Text>
                            <Text style={styles.detailValue}>
                                {selectedConversation.messages.length - 1}
                            </Text>
                        </View>
                        <View style={styles.simpleDivider} />
                        <Text style={styles.messagesTitle}>Nội dung cuộc trò chuyện:</Text>
                        <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
                            {selectedConversation.messages
                                .filter(msg => msg.role !== 'system')
                                .map((message, index) => renderMessagePreview(message, index))
                            }
                        </ScrollView>
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.simpleButton}
                            onPress={() => setViewDialogVisible(false)}
                        >
                            <Text style={styles.simpleButtonText}>Đóng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.simpleButton, styles.primaryButton]}
                            onPress={() => {
                                handleLoadConversation(selectedConversation.id);
                                setViewDialogVisible(false);
                            }}
                        >
                            <Text style={[styles.simpleButtonText, styles.primaryButtonText]}>
                                Tải cuộc trò chuyện
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }; return (
        <>
            {visible && (
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                    <View
                        style={[styles.contentContainer, { backgroundColor: theme.colors.surface }]}
                    >
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: theme.colors.primary }]}>
                                Quản lý cuộc trò chuyện
                            </Text>
                            <IconButton icon="close" size={24} onPress={onClose} />
                        </View>

                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    activeTab === 'save' && { backgroundColor: theme.colors.primary },
                                ]}
                                onPress={() => setActiveTab('save')}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        { color: activeTab === 'save' ? '#fff' : theme.colors.primary },
                                    ]}
                                >
                                    Lưu cuộc trò chuyện
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    activeTab === 'load' && { backgroundColor: theme.colors.primary },
                                ]}
                                onPress={() => setActiveTab('load')}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        { color: activeTab === 'load' ? '#fff' : theme.colors.primary },
                                    ]}
                                >
                                    Tải cuộc trò chuyện
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Divider />

                        {activeTab === 'save' ? (
                            <View style={styles.saveTab}>
                                <TextInput
                                    label="Tên cuộc trò chuyện"
                                    value={conversationName}
                                    onChangeText={setConversationName}
                                    mode="outlined"
                                    style={styles.input}
                                    placeholder="Nhập tên cho cuộc trò chuyện..."
                                />
                                <Button
                                    mode="contained"
                                    onPress={handleSaveConversation}
                                    loading={isLoading}
                                    disabled={isLoading || !conversationName.trim()}
                                    style={styles.saveButton}
                                >
                                    Lưu cuộc trò chuyện
                                </Button>
                            </View>
                        ) : (
                            <View style={styles.loadTab}>
                                {/* Header với search */}
                                <View style={styles.chatHistoryHeader}>
                                    <Text style={styles.historyTitle}>Lịch sử trò chuyện</Text>
                                    <TouchableOpacity
                                        style={styles.newChatButton}
                                        onPress={() => setActiveTab('save')}
                                    >
                                        <Text style={styles.newChatText}>+ Cuộc trò chuyện mới</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Search Bar */}
                                <View style={styles.searchBar}>
                                    <Text style={styles.searchIcon}>🔍</Text>
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholder="Tìm kiếm cuộc trò chuyện..."
                                        style={styles.searchInput}
                                        placeholderTextColor="#999"
                                    />
                                </View>

                                {/* Conversation List */}
                                {sortedConversations.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyIcon}>💬</Text>
                                        <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện</Text>
                                        <Text style={styles.emptySubtitle}>
                                            {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Bắt đầu cuộc trò chuyện đầu tiên của bạn'}
                                        </Text>
                                        {!searchQuery && (
                                            <TouchableOpacity
                                                style={styles.startChatButton}
                                                onPress={createSampleConversation}
                                            >
                                                <Text style={styles.startChatText}>Tạo cuộc trò chuyện mẫu</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ) : (
                                    <FlatList
                                        data={sortedConversations}
                                        renderItem={renderConversationItem}
                                        keyExtractor={(item) => item.id}
                                        style={styles.conversationList}
                                        showsVerticalScrollIndicator={false}
                                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                                    />
                                )}

                                {/* Footer Actions */}
                                {savedConversations.length > 0 && (
                                    <View style={styles.footerActions}>
                                        <TouchableOpacity
                                            style={styles.footerButton}
                                            onPress={() => handleClearAllConversations()}
                                        >
                                            <Text style={styles.footerButtonText}>🗑️ Xóa tất cả ({savedConversations.length})</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Modal xem chi tiết được render riêng biệt */}
            {viewDialogVisible && renderViewModal()}

            {/* Context Menu */}
            {contextMenuVisible && renderContextMenu()}
        </>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: scale(20),
        zIndex: 999,
    },
    contentContainer: {
        backgroundColor: 'white',
        borderRadius: scale(10),
        padding: scale(20),
        maxHeight: '80%',
        width: '100%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    title: {
        fontSize: scale(20),
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: verticalScale(20),
    },
    tab: {
        flex: 1,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: scale(8),
        marginHorizontal: scale(4),
        alignItems: 'center',
    },
    tabText: {
        fontSize: scale(14),
        fontWeight: '600',
    },
    saveTab: {
        paddingTop: verticalScale(20),
    },
    input: {
        marginBottom: verticalScale(20),
    },
    saveButton: {
        borderRadius: scale(8),
    },
    loadTab: {
        paddingTop: verticalScale(20),
        flex: 1,
    },
    // ChatGPT-like styles
    chatHistoryHeader: {
        marginBottom: verticalScale(16),
    },
    historyTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: verticalScale(12),
    },
    newChatButton: {
        backgroundColor: '#10a37f',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        borderRadius: scale(8),
        alignSelf: 'flex-start',
    },
    newChatText: {
        color: '#fff',
        fontSize: scale(14),
        fontWeight: '600',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f7f7f8',
        borderRadius: scale(12),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(20),
        borderWidth: 1,
        borderColor: '#e5e5e5',
    },
    searchIcon: {
        fontSize: scale(16),
        marginRight: scale(8),
        opacity: 0.6,
    },
    // *** ĐÃ XÓA KEY 'searchInput' BỊ TRÙNG ***
    searchInput: {
        flex: 1,
        fontSize: scale(16),
        color: '#333',
        padding: 0,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: 'transparent',
        borderRadius: scale(8),
    },
    conversationContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    conversationIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#f7f7f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    iconText: {
        fontSize: scale(18),
    },
    // *** ĐÃ XÓA KEY 'conversationDetails' BỊ TRÙNG ***
    conversationDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(8),
    },
    conversationTitle: {
        fontSize: scale(16),
        fontWeight: '500',
        color: '#333',
        marginBottom: verticalScale(4),
    },
    conversationDate: {
        fontSize: scale(13),
        color: '#666',
    },
    conversationMenu: {
        padding: scale(8),
    },
    menuButton: {
        padding: scale(4),
    },
    menuDots: {
        fontSize: scale(18),
        color: '#999',
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: scale(68),
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(60),
    },
    emptyIcon: {
        fontSize: scale(48),
        marginBottom: verticalScale(16),
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: scale(20),
        fontWeight: '600',
        color: '#333',
        marginBottom: verticalScale(8),
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: scale(16),
        color: '#666',
        textAlign: 'center',
        lineHeight: scale(22),
        marginBottom: verticalScale(24),
    },
    startChatButton: {
        backgroundColor: '#10a37f',
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
    },
    startChatText: {
        color: '#fff',
        fontSize: scale(16),
        fontWeight: '600',
    },
    footerActions: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: verticalScale(16),
        marginTop: verticalScale(16),
    },
    footerButton: {
        padding: scale(12),
        alignItems: 'center',
    },
    footerButtonText: {
        fontSize: scale(14),
        color: '#666',
    },
    // Context menu styles
    contextMenuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
    },
    contextMenu: {
        backgroundColor: '#fff',
        borderRadius: scale(12),
        paddingVertical: verticalScale(8),
        minWidth: scale(200),
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    contextMenuItem: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    deleteMenuItem: {
        borderBottomWidth: 0,
    },
    contextMenuText: {
        fontSize: scale(16),
        color: '#333',
    },
    deleteText: {
        color: '#ff4444',
    },
    // *** ĐÃ XÓA 'searchContainer' không dùng đến ***
    conversationList: {
        flex: 1,
        backgroundColor: '#fff',
    },
    // Styles cho dialog xem chi tiết
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
        zIndex: 1000,
    },
    viewModalContainer: {
        backgroundColor: 'white',
        borderRadius: scale(12),
        maxHeight: '85%',
        width: '95%',
        maxWidth: 450,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        flex: 1,
        paddingRight: scale(10),
    },
    closeButton: {
        width: scale(30),
        height: scale(30),
        borderRadius: scale(15),
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: scale(16),
        color: '#666',
        fontWeight: 'bold',
    },
    modalContent: {
        padding: scale(20),
        flex: 1,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: scale(20),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: scale(10),
    },
    simpleButton: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        marginRight: scale(10),
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    simpleButtonText: {
        fontSize: scale(14),
        color: '#333',
        textAlign: 'center',
        fontWeight: '600',
    },
    primaryButtonText: {
        color: '#fff',
    },
    simpleDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: verticalScale(12),
    },
    detailLabel: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#666',
    },
    detailValue: {
        fontSize: scale(14),
        color: '#333',
    },
    // *** ĐÃ XÓA 'divider' không dùng đến ***
    messagesTitle: {
        fontSize: scale(16),
        fontWeight: 'bold',
        marginBottom: verticalScale(12),
        color: '#333',
    },
    messagesContainer: {
        maxHeight: verticalScale(300),
        backgroundColor: '#f8f9fa',
        borderRadius: scale(8),
        padding: scale(12),
    },
    messagePreview: {
        marginBottom: verticalScale(12),
        padding: scale(10),
        borderRadius: scale(8),
        borderLeftWidth: 3,
    },
    userMessagePreview: {
        backgroundColor: '#E3F2FD',
        borderLeftColor: '#007AFF',
        marginLeft: scale(20),
    },
    aiMessagePreview: {
        backgroundColor: '#E8F5E8',
        borderLeftColor: '#34C759',
        marginRight: scale(20),
    },
    messageSender: {
        fontSize: scale(12),
        fontWeight: 'bold',
        marginBottom: verticalScale(4),
    },
    messageContent: {
        fontSize: scale(13),
        lineHeight: scale(18),
        color: '#333',
    },
});

export default ChatHistoryModal;
