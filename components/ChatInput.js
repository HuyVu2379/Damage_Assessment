import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, IconButton, ActivityIndicator } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

const ChatInput = ({
    inputText,
    onChangeText,
    isLoading,
    isRecording,
    onOpenCamera,
    onPickImage,
    onStartRecording,
    onStopRecording,
    onSendMessage,
    theme,
    canSend
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    // Thu gọn khi đang focus hoặc có text
    const isCompact = isFocused || inputText.trim().length > 0;

    return (
        <View style={[
            styles.chatInputContainer,
            isCompact && styles.chatInputContainerCompact
        ]}>
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
            />

            {!isCompact && !canSend && (
                <TouchableOpacity
                    onPress={isRecording ? onStopRecording : onStartRecording}
                    disabled={isLoading}
                    style={[
                        styles.microphoneButton,
                        isRecording ? styles.microphoneButtonRecording : null
                    ]}
                >
                    {isRecording ? (
                        <ActivityIndicator animating={true} color="white" size="small" />
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
                onPress={onSendMessage}
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
};

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
});

export default ChatInput;
