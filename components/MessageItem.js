import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { moderateScale, verticalScale, scale } from '../utils/scaling';
import ProductSuggestions from './ProductSuggestions';

const MessageItem = ({ item }) => {
    if (item.role === 'system') return null;

    const isUserMessage = item.role === 'user';

    return (
        <View style={[
            styles.messageContainer,
            isUserMessage ? styles.userMessageContainer : styles.aiMessageContainer
        ]}>
            <View style={[
                styles.messageBubble,
                isUserMessage ? styles.userMessageBubble : styles.aiMessageBubble
            ]}>
                {item.imageUri && (
                    <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
                )}
                {item.content.length > 0 && (
                    <Text style={isUserMessage ? styles.userMessageText : styles.aiMessageText}>
                        {item.content}
                    </Text>
                )}

                {/* Hiển thị danh sách sản phẩm nếu có */}
                {!isUserMessage && item.products && item.products.length > 0 && (
                    <ProductSuggestions products={item.products} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: verticalScale(5),
        maxWidth: '80%'
    },
    userMessageContainer: {
        alignSelf: 'flex-end'
    },
    aiMessageContainer: {
        alignSelf: 'flex-start'
    },
    messageBubble: {
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(18)
    },
    userMessageBubble: {
        backgroundColor: '#4a6fa5'
    },
    aiMessageBubble: {
        backgroundColor: '#E5E5EA'
    },
    userMessageText: {
        color: '#ffffff',
        fontSize: moderateScale(15)
    },
    aiMessageText: {
        color: '#000000',
        fontSize: moderateScale(15)
    },
    messageImage: {
        width: scale(200),
        height: verticalScale(150),
        borderRadius: moderateScale(8),
        marginBottom: verticalScale(8)
    },
});

export default MessageItem;
