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
import CameraModal from './components/CameraModal';
import ImagePreview from './components/ImagePreview';
import ChatInput from './components/ChatInput';
import SidebarMenu from './components/SidebarMenu';

// Hooks
// import { useAudioRecording } from './hooks/useAudioRecording';
import { useCamera } from './hooks/useCamera';
import { useOptimizedInput } from './hooks/useDebounce';

// Utils
import { theme } from './utils/theme';
import { verticalScale, scale } from './utils/scaling';
import { convertImageToBase64 } from './utils/convert';

// API
import { getAiResponse, parseProductSuggestions, validateProductData, extractProductNames, searchMultipleProducts, isProductRelatedQuery, extractProductKeywordsFromQuery } from './services/api';
import { chatStorage } from './services/chatStorage';

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Chào bạn! Tôi là chuyên gia xây dựng AI. Gửi ảnh hoặc câu hỏi, tôi sẽ tự động nhận diện và tư vấn phù hợp!' },
  ]);

  // Optimize TextInput với debounce
  const { displayValue: inputText, debouncedValue: debouncedInput, setValue: setInputText } = useOptimizedInput('', 100);

  const [isLoading, setIsLoading] = useState(false);
  const [pickedImage, setPickedImage] = useState(null);
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
      setShouldScrollToEnd(true);
      // Đảm bảo scroll to bottom sau khi load với nhiều lần thử
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 500);
    } else {
      // Nếu không có tin nhắn cũ, đảm bảo scroll cho tin nhắn hệ thống
      setShouldScrollToEnd(true);
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
    // Scroll to bottom sau khi load conversation với retry
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
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

    try {
      let aiResponseContent;

      // Tự động chọn model: có ảnh dùng gemini-vision, không có ảnh dùng gemini text
      if (hasImage) {
        try {
          const base64Image = await convertImageToBase64(pickedImage);

          // Chuẩn bị context cho AI: bao gồm cả lịch sử chat và câu hỏi hiện tại
          const contextMessages = newMessages
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
              role: msg.role,
              content: msg.imageUri ? msg.content.replace(/\[Đã gửi 1 ảnh\]\s*/, '') : msg.content
            }));

          // AI sẽ tự động nhận diện và phản hồi phù hợp với cả ảnh và text
          aiResponseContent = await getAiResponse(contextMessages, 'gemini-vision', true, base64Image);
        } catch (error) {
          console.error('Lỗi xử lý ảnh:', error);
          aiResponseContent = 'Xin lỗi, có lỗi xảy ra khi xử lý ảnh. Bạn có thể thử lại không?';
        }
      } else {
        // Không có ảnh: Dùng gemini text model cho chat thường
        const apiPayload = newMessages
          .filter(msg => msg.role !== 'system')
          .map(msg => ({ role: msg.role, content: msg.content }));

        aiResponseContent = await getAiResponse(apiPayload, 'gemini-vision', false, null);
      }

      // Tạo AI response message
      const aiResponseMessage = { role: 'assistant', content: aiResponseContent };
      setMessages(prev => [...prev, aiResponseMessage]);

      // CHỈ tìm sản phẩm khi AI đã đề xuất sản phẩm cụ thể (có dòng "Sản phẩm cần:")
      setTimeout(async () => {
        try {
          // Extract tên sản phẩm từ phân tích
          const productNames = extractProductNames(aiResponseContent);

          // CHỈ xử lý nếu AI đã đề xuất sản phẩm cụ thể
          if (productNames.length > 0) {
            console.log('🛍️ AI đã đề xuất sản phẩm, tìm kiếm với SerpAPI...');
            setIsLoading(true);

            // Tìm sản phẩm thật với SerpAPI
            const products = await searchMultipleProducts(productNames);

            if (products.length > 0) {
              // Hiển thị tin nhắn sản phẩm
              const productMessage = {
                role: 'assistant',
                content: '🛒 **Sản phẩm được đề xuất**\n\nDựa trên phân tích hư hỏng, đây là những sản phẩm phù hợp để sửa chữa:',
                products: products
              };

              setMessages(prev => [...prev, productMessage]);
              console.log('✅ Hiển thị sản phẩm thành công');
            }

            setIsLoading(false);
          } else {
            // KHÔNG thêm message gợi ý nếu AI không đề xuất sản phẩm
            console.log('📝 AI không đề xuất sản phẩm cụ thể, không hiển thị gợi ý');
          }
        } catch (productError) {
          console.error('❌ Lỗi tìm sản phẩm:', productError);
          setIsLoading(false);
          // Silent fail - không hiển thị lỗi cho user
        }

        // Force scroll to end
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 200);
      }, 1000);

      setIsLoading(false);

      // FIX: Force scroll to end sau khi có AI response
      setShouldScrollToEnd(true);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);

    } catch (error) {
      console.error('❌ Lỗi xử lý tin nhắn:', error);
      setIsLoading(false);
      Alert.alert(
        'Lỗi xử lý tin nhắn',
        `Có lỗi xảy ra: ${error.message}\n\nVui lòng thử lại.`,
        [{ text: 'OK', onPress: () => { } }]
      );
    }
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
  ), []); // Empty deps array vì MessageItem đã được memo với custom comparison

  // Optimize keyExtractor
  const keyExtractor = useCallback((item, index) => {
    return `message-${index}-${item.role}`;
  }, []);

  const canSendMessage = inputText.trim().length > 0 || pickedImage;

  // Hàm scroll to end thủ công - FIX cải tiến
  const scrollToEnd = useCallback(() => {
    // Kiểm tra ref có tồn tại không
    if (!flatListRef.current) return;

    try {
      // Phương pháp đơn giản và ổn định nhất
      flatListRef.current.scrollToEnd({ animated: true });

      // Set state sau một delay ngắn để tránh conflict
      setTimeout(() => {
        setShouldScrollToEnd(true);
      }, 300);
    } catch (error) {
      // Fallback nếu có lỗi
      console.warn('Scroll error:', error);
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
            scrollEventThrottle={200} // Tăng từ 100 lên 200 để giảm tần suất event

            // Performance optimizations - Tối ưu cho list lớn
            removeClippedSubviews={true}
            initialNumToRender={4} // Giảm xuống 4 để tăng performance
            maxToRenderPerBatch={2} // Giảm xuống 2
            windowSize={6} // Giảm xuống 6
            updateCellsBatchingPeriod={200} // Tăng lên 200ms để giảm tần suất update
            getItemLayout={undefined} // Tắt getItemLayout để tránh conflict
            legacyImplementation={false}
            disableVirtualization={false} // Đảm bảo virtualization được bật

            // Scroll optimization - Cải tiến
            onContentSizeChange={(contentWidth, contentHeight) => {
              // Chỉ auto scroll khi shouldScrollToEnd = true
              if (shouldScrollToEnd) {
                // Sử dụng requestAnimationFrame để đảm bảo layout đã hoàn thành
                requestAnimationFrame(() => {
                  if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                  }
                });
              }
            }}
            onLayout={(event) => {
              // Scroll to end khi component được layout lần đầu
              if (shouldScrollToEnd) {
                const { height } = event.nativeEvent.layout;
                if (height > 0) { // Đảm bảo layout đã có kích thước
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }, 100);
                }
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
