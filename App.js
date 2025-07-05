import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { IconButton } from 'react-native-paper';

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
// import { useAudioRecording } from './hooks/useAudioRecording';
import { useCamera } from './hooks/useCamera';
import { useOptimizedInput } from './hooks/useDebounce';

// Utils
import { theme } from './utils/theme';
import { verticalScale, scale } from './utils/scaling';

// Tắt logs để giảm lag terminal
const log = __DEV__ ? console.log : () => {};
const error = __DEV__ ? console.error : () => {};

// API
import { getAiResponse, parseProductSuggestions, validateProductData } from './services/api';
import { chatStorage } from './services/chatStorage';

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Chào bạn! Tôi là chuyên gia xây dựng AI. Gửi ảnh hoặc câu hỏi, tôi sẽ tự động nhận diện và tư vấn phù hợp!' },
  ]);
  
  // Optimize TextInput với debounce
  const { displayValue: inputText, debouncedValue: debouncedInput, setValue: setInputText } = useOptimizedInput('', 100);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini'); // Mặc định là gemini
  const [pickedImage, setPickedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatHistoryVisible, setChatHistoryVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(true);

  const flatListRef = useRef(null);
  const previousMessagesLength = useRef(messages.length);

  // Load cuộc trò chuyện cuối cùng khi app khởi động
  useEffect(() => {
    loadLastConversation();
  }, []);

  // FIX: Auto scroll to end when new messages are added
  useEffect(() => {
    if (messages.length > previousMessagesLength.current) {
      // Luôn scroll khi có message mới
      const timeoutId = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setShouldScrollToEnd(true);
      }, 150);

      return () => clearTimeout(timeoutId);
    }
    previousMessagesLength.current = messages.length;
  }, [messages]);

  // Auto-save cuộc trò chuyện hiện tại khi có thay đổi
  useEffect(() => {
    if (messages.length > 1) {
      chatStorage.saveCurrentChat(messages);
    }
  }, [messages]);

  // Custom hooks
  // const {
  //   isRecording,
  //   startRecording,
  //   stopRecording
  // } = useAudioRecording(setInputText, setIsLoading);

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
      // Đảm bảo scroll to bottom sau khi load
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    }
  };

  // Bắt đầu cuộc trò chuyện mới
  const startNewChat = () => {
    setMessages([{ role: 'system', content: 'Chào bạn! Tôi là chuyên gia xây dựng AI. Gửi ảnh hoặc câu hỏi, tôi sẽ tự động nhận diện và tư vấn phù hợp!' }]);
    setInputText('');
    setPickedImage(null);
    setShouldScrollToEnd(true);
  };

  // Load cuộc trò chuyện đã lưu
  const loadConversation = (savedMessages) => {
    setMessages(savedMessages);
    setInputText('');
    setPickedImage(null);
    setShouldScrollToEnd(true);
    // Scroll to bottom sau khi load conversation
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 200);
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

    // Đảm bảo auto-scroll được bật khi gửi tin nhắn
    setShouldScrollToEnd(true);

    let messageContent = inputText.trim();
    if (pickedImage && messageContent) {
      messageContent = `[Đã gửi 1 ảnh] ${messageContent}`;
    } else if (pickedImage) {
      messageContent = `[Đã gửi 1 ảnh]`;
    }

    const userMessage = {
      role: 'user',
      content: messageContent,
      imageUri: pickedImage
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Lưu trạng thái có ảnh - AI sẽ tự động nhận diện và phản hồi phù hợp
    const hasImage = !!pickedImage;

    setInputText('');
    setPickedImage(null);
    setIsLoading(true);

    let aiResponseContent;
    
    // Tự động chọn model: có ảnh dùng gemini-vision, không có ảnh dùng gemini text
    if (hasImage) {
      // Có ảnh: Luôn dùng gemini-vision với prompt thông minh
      const { convertImageToBase64 } = await import('./services/api');
      
      try {
        const base64Image = await convertImageToBase64(pickedImage);
        // AI sẽ tự động nhận diện và phản hồi phù hợp
        aiResponseContent = await getAiResponse([], 'gemini-vision', true, base64Image);
      } catch (error) {
        error('Lỗi xử lý ảnh:', error);
        aiResponseContent = 'Xin lỗi, có lỗi xảy ra khi xử lý ảnh. Bạn có thể thử lại không?';
      }
    } else {
      // Không có ảnh: Dùng gemini text model cho chat thường
      const apiPayload = newMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({ role: msg.role, content: msg.content }));
      
      aiResponseContent = await getAiResponse(apiPayload, 'gemini', false);
    }

    // Parse sản phẩm nếu AI phát hiện cần gợi ý sản phẩm
    let aiResponseMessage;
    if (hasImage) {
      // Với ảnh, AI có thể tự động gợi ý sản phẩm nếu phát hiện hư hỏng
      const parsedResponse = parseProductSuggestions(aiResponseContent);
      const validatedProducts = validateProductData(parsedResponse.products);
      
      aiResponseMessage = {
        role: 'assistant',
        content: parsedResponse.analysis,
        products: validatedProducts
      };
    } else {
      aiResponseMessage = { role: 'assistant', content: aiResponseContent };
    }

    setMessages(prev => [...prev, aiResponseMessage]);
    setIsLoading(false);

    // FIX: Force scroll to end sau khi có AI response
    setShouldScrollToEnd(true);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  // Test function để kiểm tra hiển thị sản phẩm
  const testProductDisplay = () => {
    const testProducts = [
      {
        name: 'Keo trám Sikaflex',
        brand: 'Sika',
        description: 'Keo trám chống thấm chất lượng cao',
        estimatedPrice: '120.000 VND',
        category: 'Vật liệu xây dựng',
        imageUrl: 'https://example.com/sika.jpg',
        purchaseLink: '#'
      }
    ];

    const testMessage = {
      role: 'assistant',
      content: 'Đây là tin nhắn test để hiển thị sản phẩm',
      products: testProducts
    };

    setMessages(prev => [...prev, testMessage]);
  };

  // Optimize renderMessageItem với useCallback để giảm re-render
  const renderMessageItem = useCallback(({ item, index }) => (
    <MessageItem 
      item={item} 
      index={index}
    />
  ), []);

  // Optimize keyExtractor
  const keyExtractor = useCallback((item, index) => {
    return `message-${index}-${item.role}`;
  }, []);

  // Optimize getItemLayout nếu messages có height cố định
  const getItemLayout = useCallback((data, index) => {
    const ESTIMATED_ITEM_HEIGHT = 120; // Ước tính height cho mỗi message
    return {
      length: ESTIMATED_ITEM_HEIGHT,
      offset: ESTIMATED_ITEM_HEIGHT * index,
      index,
    };
  }, []);

  const canSendMessage = inputText.trim().length > 0 || pickedImage;

  // Hàm scroll to end thủ công - FIX
  const scrollToEnd = useCallback(() => {
    // Thực hiện scroll ngay lập tức với nhiều phương pháp để đảm bảo hoạt động
    if (flatListRef.current) {
      // Phương pháp 1: scrollToEnd trực tiếp
      flatListRef.current.scrollToEnd({ animated: true });
      
      // Phương pháp 2: scrollToOffset với giá trị lớn (backup)
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ 
          offset: 999999, 
          animated: true 
        });
      }, 50);
      
      // Chỉ set state sau khi scroll hoàn thành để tránh button biến mất quá sớm
      setTimeout(() => {
        setShouldScrollToEnd(true);
      }, 400); // Đợi animation scroll hoàn thành
    }
  }, []);

  // Handler để phát hiện khi user scroll - FIX
  const handleScroll = useCallback((event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    // Kiểm tra nếu content size nhỏ hơn layout thì luôn ở bottom
    if (contentSize.height <= layoutMeasurement.height) {
      setShouldScrollToEnd(true);
      return;
    }

    // Kiểm tra có đang ở cuối không với threshold chính xác hơn
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    const isAtBottom = distanceFromBottom <= 100; // Tăng threshold lên 100px để dễ detect hơn

    // Chỉ update state khi có thay đổi thực sự để tránh re-render không cần thiết
    setShouldScrollToEnd(prev => prev !== isAtBottom ? isAtBottom : prev);
  }, []);

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

        {/* Model Selection Modal - Tạm thời ẩn */}
        {/* <ModelSelectionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelectModel={selectModel}
          selectedModel={selectedModel}
        /> */}

        {/* Header */}
        <Header
          onNewChat={() => setSidebarVisible(true)}
          theme={theme}
        />

        <View style={styles.mainContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={keyExtractor}
            style={styles.chatMessages}
            contentContainerStyle={{ paddingVertical: verticalScale(10) }}
            ListFooterComponent={isLoading ? <LoadingIndicator theme={theme} /> : null}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            
            // Performance optimizations
            removeClippedSubviews={true}
            initialNumToRender={8}
            maxToRenderPerBatch={5}
            windowSize={10}
            updateCellsBatchingPeriod={50}
            getItemLayout={getItemLayout}
            
            // Scroll optimization
            onContentSizeChange={(contentWidth, contentHeight) => {
              // Chỉ auto scroll khi shouldScrollToEnd = true
              if (shouldScrollToEnd) {
                // Sử dụng requestAnimationFrame để đảm bảo layout đã hoàn thành
                requestAnimationFrame(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                });
              }
            }}
            onLayout={() => {
              // Scroll to end khi component được layout lần đầu
              if (shouldScrollToEnd) {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                }, 50);
              }
            }}
          />

          {/* Scroll to Bottom Button */}
          {!shouldScrollToEnd && (
            <TouchableOpacity
              style={styles.scrollToBottomButton}
              onPress={scrollToEnd}
              activeOpacity={0.7}
            >
              <IconButton
                icon="chevron-down"
                size={24}
                iconColor={theme.colors.accent}
                style={styles.scrollIcon}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Input Container - Cố định ở dưới, không bị KeyboardAvoidingView ảnh hưởng */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.bottomInputContainer}>
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
              // isRecording={isRecording}
              onOpenCamera={openCamera}
              onPickImage={pickImage}
              // onStartRecording={startRecording}
              // onStopRecording={stopRecording}
              onSendMessage={handleSendMessage}
              theme={theme}
              canSend={canSendMessage}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF7' // Vàng rất nhạt, sáng hơn
  },
  mainContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: scale(10)
  },
  bottomInputContainer: {
    backgroundColor: '#FFFEF7',
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: scale(20),
    bottom: 0, // Sát luôn với thanh input
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000, // Đảm bảo nút luôn hiện trên cùng
  },
  scrollIcon: {
    margin: 0,
  },
});

export default App;