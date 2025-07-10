import React, { useState, memo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, IconButton, ActivityIndicator } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';
import VoiceFeedback from './VoiceFeedback';

const ChatInput = memo(({
    inputText,
    onChangeText,
    isLoading,
    isRecording,
    isTranscribing,
    onOpenCamera,
    onPickImage,
    onStartRecording,
    onStopRecording,
    onSendMessage,
    theme,
    canSend
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isStopRequested, setIsStopRequested] = useState(false); // Track stop request
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState('success');

    // Optimize callbacks
    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);
    const handleSend = useCallback(() => {
        if (canSend && !isLoading) {
            onSendMessage();
        }
    }, [canSend, isLoading, onSendMessage]);

    // Reset isStopRequested when recording stops
    React.useEffect(() => {
        if (!isRecording && !isTranscribing) {
            setIsStopRequested(false);
        }
    }, [isRecording, isTranscribing]);

    // Show feedback when transcription completes
    React.useEffect(() => {
        if (!isRecording && !isTranscribing && isStopRequested) {
            showFeedbackMessage('Hoàn thành nhận diện!', 'success');
        }
    }, [isRecording, isTranscribing, isStopRequested, showFeedbackMessage]);

    // Show feedback helper
    const showFeedbackMessage = useCallback((message, type = 'success') => {
        setFeedbackMessage(message);
        setFeedbackType(type);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2500);
    }, []);

    // Debug function để kiểm tra state
    const handleMicPress = useCallback(() => {
        console.log('🎯 Mic button pressed, current states:', {
            isRecording,
            isTranscribing,
            isLoading,
            canSend,
            isStopRequested
        });

        if (isRecording) {
            if (isStopRequested) {
                console.log('⏳ Stop already requested, ignoring...');
                showFeedbackMessage('Đã nhấn dừng, vui lòng đợi...', 'warning');
                return;
            }

            console.log('🛑 Calling onStopRecording...');
            setIsStopRequested(true); // Immediately set stop requested
            showFeedbackMessage('Đang dừng ghi âm...', 'success');
            onStopRecording();
        } else {
            console.log('🎙️ Calling onStartRecording...');
            showFeedbackMessage('Bắt đầu ghi âm...', 'success');
            onStartRecording();
        }
    }, [isRecording, isTranscribing, isLoading, canSend, isStopRequested, onStopRecording, onStartRecording, showFeedbackMessage]);

    const isCompact = isFocused || inputText.trim().length > 0;

    return (
        <View style={[
            styles.chatInputContainer,
            isCompact && styles.chatInputContainerCompact
        ]}>
            {/* Voice Feedback */}
            <VoiceFeedback
                isVisible={showFeedback}
                message={feedbackMessage}
                type={feedbackType}
            />

            {!isCompact && (
                <>
                    <IconButton
                        icon="camera"
                        size={moderateScale(24)}
                        iconColor={theme.colors.iconSecondary}
                        onPress={onOpenCamera}
                        disabled={isLoading}
                        style={styles.actionButton}
                    />
                    <IconButton
                        icon="image"
                        size={moderateScale(24)}
                        iconColor={theme.colors.iconSecondary}
                        onPress={onPickImage}
                        disabled={isLoading}
                        style={styles.actionButton}
                    />
                </>
            )}

            <RNTextInput
                style={[
                    styles.textInput,
                    { fontSize: moderateScale(14), flex: 1 },
                    isCompact && styles.textInputCompact
                ]}
                value={inputText}
                onChangeText={onChangeText}
                placeholder={isCompact ? "Aa" : "Aa"}
                placeholderTextColor={theme.colors.placeholder}
                editable={!isLoading}
                onFocus={handleFocus}
                onBlur={handleBlur}
                multiline={false}
                textAlign="left"
                textAlignVertical="center"
                // Performance optimizations
                autoCorrect={false}
                autoCapitalize="none"
                textContentType="none"
                keyboardShouldPersistTaps="handled"
            />

            {!isCompact && !canSend && (
                <TouchableOpacity
                    onPress={handleMicPress}
                    disabled={isLoading && !isRecording && !isTranscribing}
                    style={[
                        styles.microphoneButton,
                        (isRecording || isTranscribing || isStopRequested) ? styles.microphoneButtonRecording : null,
                        isStopRequested ? styles.microphoneButtonStopping : null
                    ]}
                >
                    {isRecording || isTranscribing || isStopRequested ? (
                        <View style={styles.microphoneContent}>
                            <ActivityIndicator
                                animating={true}
                                color="white"
                                size="small"
                            />
                            {isStopRequested && (
                                <View style={styles.stoppedIndicator}>
                                    <IconButton
                                        icon="check"
                                        size={moderateScale(12)}
                                        iconColor="white"
                                        style={styles.checkIcon}
                                    />
                                </View>
                            )}
                        </View>
                    ) : (
                        <IconButton
                            icon="microphone"
                            size={moderateScale(24)}
                            iconColor={theme.colors.iconPrimary}
                        />
                    )}
                </TouchableOpacity>
            )}

            <IconButton
                icon="send"
                size={moderateScale(22)}
                iconColor={canSend && !isLoading ? '#FFFFFF' : theme.colors.iconPrimary}
                onPress={handleSend}
                disabled={isLoading || !canSend}
                style={canSend && !isLoading ? {
                    backgroundColor: theme.colors.accent,
                    borderRadius: moderateScale(18)
                } : {
                    backgroundColor: 'transparent'
                }}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    chatInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(8),
        backgroundColor: '#FFFEF7', // Cùng màu với app background
        minHeight: verticalScale(55),
    },
    chatInputContainerCompact: {
        paddingHorizontal: scale(12),
        minHeight: verticalScale(50),
    },
    textInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginHorizontal: scale(2),
        borderRadius: moderateScale(20), // Thay đổi từ 8 thành 20 để tròn như compact
        borderWidth: 0,
        paddingHorizontal: scale(12),
        paddingVertical: scale(8), // Giảm padding để căn giữa tốt hơn
        minHeight: verticalScale(38),
        // Tạo độ sâu với shadow nhẹ
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    textInputCompact: {
        backgroundColor: '#FFFFFF', // Đồng bộ màu nền
        borderRadius: moderateScale(20),
        marginHorizontal: scale(4),
        paddingVertical: scale(6), // Giảm padding dọc cho compact
        minHeight: verticalScale(36),
        elevation: 2, // Đồng bộ elevation
        shadowOpacity: 0.08, // Đồng bộ shadow
    },
    actionButton: {
        margin: 0,
        marginHorizontal: scale(2),
    },
    microphoneButton: {
        width: moderateScale(42),
        height: moderateScale(42),
        borderRadius: moderateScale(21),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: scale(4),
    },
    microphoneButtonRecording: {
        backgroundColor: '#ff4444',
    },
    microphoneButtonStopping: {
        backgroundColor: '#ff8800', // Orange color to indicate stopping
    },
    microphoneContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    stoppedIndicator: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#00aa00',
        borderRadius: moderateScale(8),
        width: moderateScale(16),
        height: moderateScale(16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkIcon: {
        margin: 0,
        padding: 0,
    },
});

export default ChatInput;
