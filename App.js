import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

// Components
import Header from './components/Header';
import MessageItem from './components/MessageItem';
import LoadingIndicator from './components/LoadingIndicator';
import ModelSelectionModal from './components/ModelSelectionModal';
import CameraModal from './components/CameraModal';
import ImagePreview from './components/ImagePreview';
import ChatInput from './components/ChatInput';
import ChatHistoryModal from './components/ChatHistoryModal';
import SidebarMenu from './components/SidebarMenu';

// Hooks
import { useAudioRecording } from './hooks/useAudioRecording';
import { useCamera } from './hooks/useCamera';

// Utils
import { theme } from './utils/theme';
import { verticalScale, scale } from './utils/scaling';

// API
import { getAiResponse } from './services/api';
import { chatStorage } from './services/chatStorage';

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Chào bạn, hãy chọn model và bắt đầu!' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('groq');
  const [pickedImage, setPickedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatHistoryVisible, setChatHistoryVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const flatListRef = useRef(null);

  // Load cuộc trò chuyện cuối cùng khi app khởi động
  useEffect(() => {
    loadLastConversation();
  }, []);

  // Auto-save cuộc trò chuyện hiện tại khi có thay đổi
  useEffect(() => {
    if (messages.length > 1) {
      chatStorage.saveCurrentChat(messages);
    }
  }, [messages]);

  // Custom hooks
  const {
    isRecording,
    startRecording,
    stopRecording
  } = useAudioRecording(setInputText, setIsLoading);

  const {
    isCameraVisible,
    setIsCameraVisible,
    openCamera,
    takePicture,
    pickImage
  } = useCamera(setPickedImage);

  // Load cuộc trò chuyện cuối cùng
  const loadLastConversation = async () => {
    const lastMessages = await chatStorage.loadCurrentChat();
    if (lastMessages && lastMessages.length > 1) {
      setMessages(lastMessages);
    }
  };

  // Bắt đầu cuộc trò chuyện mới
  const startNewChat = () => {
    setMessages([{ role: 'system', content: 'Chào bạn, hãy chọn model và bắt đầu!' }]);
    setInputText('');
    setPickedImage(null);
  };

  // Load cuộc trò chuyện đã lưu
  const loadConversation = (savedMessages) => {
    setMessages(savedMessages);
    setInputText('');
    setPickedImage(null);
  };

  // Handlers
  const selectModel = (model) => {
    setSelectedModel(model);
    setModalVisible(false);
  };

  const handleSendMessage = async () => {
    if ((inputText.trim().length === 0 && !pickedImage) || isLoading) {
      return;
    }

    let messageContent = inputText.trim();
    if (pickedImage) {
      messageContent = `[Đã gửi 1 ảnh] ${messageContent}`;
    }

    const userMessage = {
      role: 'user',
      content: messageContent,
      imageUri: pickedImage
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Lưu trạng thái có ảnh để quyết định loại prompt
    const hasImage = !!pickedImage;

    setInputText('');
    setPickedImage(null);
    setIsLoading(true);

    const apiPayload = newMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({ role: msg.role, content: msg.content }));

    // Truyền tham số isDamageAnalysis dựa trên việc có ảnh hay không
    const aiResponseContent = await getAiResponse(apiPayload, selectedModel, hasImage);
    const aiResponseMessage = { role: 'assistant', content: aiResponseContent };
    setMessages(prev => [...prev, aiResponseMessage]);
    setIsLoading(false);
  };

  const renderMessageItem = ({ item }) => (
    <MessageItem item={item} />
  );

  const canSendMessage = inputText.trim().length > 0 || pickedImage;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        {/* Sidebar Menu */}
        <SidebarMenu
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onNewChat={startNewChat}
          onLoadConversation={loadConversation}
          currentMessages={messages}
          theme={theme}
        />

        {/* Camera Modal */}
        <CameraModal
          visible={isCameraVisible}
          onClose={() => setIsCameraVisible(false)}
          onTakePicture={takePicture}
          onPickImage={pickImage}
        />

        {/* Chat History Modal */}
        <ChatHistoryModal
          visible={chatHistoryVisible}
          onClose={() => setChatHistoryVisible(false)}
          onLoadConversation={loadConversation}
          currentMessages={messages}
          theme={theme}
        />

        {/* Model Selection Modal */}
        <ModelSelectionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelectModel={selectModel}
          selectedModel={selectedModel}
        />

        {/* Header */}
        <Header
          selectedModel={selectedModel}
          onOpenModal={() => setModalVisible(true)}
          onOpenChatHistory={() => setChatHistoryVisible(true)}
          onNewChat={() => setSidebarVisible(true)}
          theme={theme}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(_, index) => index.toString()}
            style={styles.chatMessages}
            contentContainerStyle={{ paddingVertical: verticalScale(10) }}
            ListFooterComponent={isLoading ? <LoadingIndicator theme={theme} /> : null}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Image Preview */}
          <ImagePreview
            imageUri={pickedImage}
            onRemove={() => setPickedImage(null)}
          />

          {/* Chat Input */}
          <ChatInput
            inputText={inputText}
            onChangeText={setInputText}
            isLoading={isLoading}
            isRecording={isRecording}
            onOpenCamera={openCamera}
            onPickImage={pickImage}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onSendMessage={handleSendMessage}
            theme={theme}
            canSend={canSendMessage}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  keyboardAvoidingContainer: {
    flex: 1
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: scale(10)
  },
});

export default App;