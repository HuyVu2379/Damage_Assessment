import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAT_HISTORY_KEY = 'chat_history';
const SAVED_CONVERSATIONS_KEY = 'saved_conversations';

export const chatStorage = {
    // Lưu cuộc trò chuyện hiện tại
    saveCurrentChat: async (messages) => {
        try {
            const jsonValue = JSON.stringify(messages);
            await AsyncStorage.setItem(CHAT_HISTORY_KEY, jsonValue);

            // Tự động lưu vào lịch sử nếu có tin nhắn từ user
            if (messages && messages.length > 1) {
                await chatStorage.autoSaveChatToHistory(messages);
            }

            return true;
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
            return false;
        }
    },

    // Tự động lưu cuộc trò chuyện vào lịch sử
    autoSaveChatToHistory: async (messages) => {
        try {
            // Chỉ lưu nếu có ít nhất 1 tin nhắn từ user và 1 từ assistant
            const userMessages = messages.filter(msg => msg.role === 'user');
            const assistantMessages = messages.filter(msg => msg.role === 'assistant');

            if (userMessages.length === 0 || assistantMessages.length === 0) {
                return;
            }

            const existingHistory = await chatStorage.getChatHistory();

            // Kiểm tra xem cuộc trò chuyện này đã tồn tại chưa (dựa trên tin nhắn đầu tiên)
            const firstUserMessage = userMessages[0];
            const existingChat = existingHistory.find(chat => {
                const firstMsg = chat.messages.find(msg => msg.role === 'user');
                if (!firstMsg || !firstUserMessage) return false;

                // So sánh dựa trên content và imageUri (nếu có)
                const contentMatch = firstMsg.content === firstUserMessage.content;
                const imageMatch = firstMsg.imageUri === firstUserMessage.imageUri;

                return contentMatch && imageMatch;
            });

            if (!existingChat) {
                // Tạo cuộc trò chuyện mới trong lịch sử
                const newChatHistory = {
                    id: Date.now().toString(),
                    messages: messages.filter(msg => msg.role !== 'system'),
                    timestamp: Date.now(),
                    createdAt: new Date().toISOString(),
                };

                const updatedHistory = [...existingHistory, newChatHistory];
                const jsonValue = JSON.stringify(updatedHistory);
                await AsyncStorage.setItem(SAVED_CONVERSATIONS_KEY, jsonValue);
            } else {
                // Cập nhật cuộc trò chuyện hiện có
                const updatedHistory = existingHistory.map(chat => {
                    if (chat.id === existingChat.id) {
                        return {
                            ...chat,
                            messages: messages.filter(msg => msg.role !== 'system'),
                            timestamp: Date.now(),
                        };
                    }
                    return chat;
                });

                const jsonValue = JSON.stringify(updatedHistory);
                await AsyncStorage.setItem(SAVED_CONVERSATIONS_KEY, jsonValue);
            }
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
        }
    },

    // Tải cuộc trò chuyện cuối cùng
    loadCurrentChat: async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
            return null;
        }
    },

    // Lưu cuộc trò chuyện với tên cụ thể
    saveConversation: async (name, messages) => {
        try {
            // Loại bỏ console.log để giảm lag terminal
            const existingConversations = await chatStorage.getSavedConversations();
            // Loại bỏ console.log để giảm lag terminal

            const newConversation = {
                id: Date.now().toString(),
                name: name,
                messages: messages,
                createdAt: new Date().toISOString(),
            };
            // Loại bỏ console.log để giảm lag terminal

            const updatedConversations = [...existingConversations, newConversation];
            // Loại bỏ console.log để giảm lag terminal

            const jsonValue = JSON.stringify(updatedConversations);
            await AsyncStorage.setItem(SAVED_CONVERSATIONS_KEY, jsonValue);
            // Loại bỏ console.log để giảm lag terminal
            return true;
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
            return false;
        }
    },

    /** // <--- Thêm dòng này
   * @param {Array} history
   */ // <--- Và dòng này
    saveChatHistory: async (history) => {
        try {
            const jsonValue = JSON.stringify(history);
            await AsyncStorage.setItem(SAVED_CONVERSATIONS_KEY, jsonValue);
            return true;
        } catch (error) {
            console.error('Lỗi khi lưu toàn bộ lịch sử chat:', error);
            return false;
        }
    },

    // Lấy danh sách cuộc trò chuyện đã lưu
    getSavedConversations: async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(SAVED_CONVERSATIONS_KEY);
            const result = jsonValue != null ? JSON.parse(jsonValue) : [];
            return result;
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
            return [];
        }
    },

    // Lấy lịch sử chat cho sidebar (alias cho getSavedConversations)
    getChatHistory: async () => {
        return await chatStorage.getSavedConversations();
    },

    // Tải cuộc trò chuyện cụ thể
    loadConversation: async (conversationId) => {
        try {
            const conversations = await chatStorage.getSavedConversations();
            const conversation = conversations.find(conv => conv.id === conversationId);
            return conversation ? conversation.messages : null;
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
            return null;
        }
    },

    // Xóa cuộc trò chuyện
    deleteConversation: async (conversationId) => {
        try {
            const conversations = await chatStorage.getSavedConversations();
            const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
            const jsonValue = JSON.stringify(updatedConversations);
            await AsyncStorage.setItem(SAVED_CONVERSATIONS_KEY, jsonValue);
            return true;
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
            return false;
        }
    },

    // Xóa chat (alias cho deleteConversation)
    deleteChat: async (chatId) => {
        return await chatStorage.deleteConversation(chatId);
    },

    // Xóa tất cả dữ liệu cuộc trò chuyện
    clearAllData: async () => {
        try {
            await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
            await AsyncStorage.removeItem(SAVED_CONVERSATIONS_KEY);
            return true;
        } catch (error) {
            // Loại bỏ console.error để giảm lag terminal
            return false;
        }
    }
};
