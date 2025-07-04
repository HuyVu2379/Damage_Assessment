import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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
    return (
        <View style={styles.chatInputContainer}>
            <IconButton
                icon="camera"
                size={moderateScale(24)}
                onPress={onOpenCamera}
                disabled={isLoading}
            />
            <IconButton
                icon="image"
                size={moderateScale(24)}
                onPress={onPickImage}
                disabled={isLoading}
            />
            <TextInput
                style={[styles.textInput, { fontSize: moderateScale(14), flex: 1 }]}
                value={inputText}
                onChangeText={onChangeText}
                placeholder="Nhập tin nhắn hoặc thu âm..."
                dense
                disabled={isLoading}
                theme={{ ...theme, colors: { text: '#000' } }}
            />
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
                        color={theme.colors.primary}
                    />
                )}
            </TouchableOpacity>
            <IconButton
                icon="send"
                size={moderateScale(24)}
                color={theme.colors.accent}
                onPress={onSendMessage}
                disabled={isLoading || !canSend}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    chatInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(5),
        backgroundColor: '#ffffff',
        borderTopColor: '#ddd',
        borderTopWidth: 1
    },
    textInput: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    microphoneButton: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: scale(5),
    },
    microphoneButtonRecording: {
        backgroundColor: '#ff4444',
    },
});

export default ChatInput;
