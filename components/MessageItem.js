import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { moderateScale, verticalScale, scale } from '../utils/scaling';
import { theme } from '../utils/theme';
import ProductSuggestions from './ProductSuggestions';

const MessageItem = memo(({ item, index }) => {
    if (item.role === 'system') return null;

    const isUserMessage = item.role === 'user';
    const hasProducts = !isUserMessage && item.products && item.products.length > 0;

    return (
        <View style={[
            styles.messageContainer,
            isUserMessage ? styles.userMessageContainer : styles.aiMessageContainer,
            hasProducts && styles.messageContainerWithProducts
        ]}>
            <View style={[
                styles.messageBubble,
                isUserMessage ? styles.userMessageBubble : styles.aiMessageBubble,
                hasProducts && styles.messageBubbleWithProducts,
                isUserMessage ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
            ]}>
                {item.imageUri && (
                    <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
                )}
                {item.content && item.content.length > 0 && (
                    <Text style={isUserMessage ? styles.userMessageText : styles.aiMessageText}>
                        {item.content}
                    </Text>
                )}

                {/* Hiển thị danh sách sản phẩm nếu có */}
                {hasProducts && (
                    <View style={styles.productContainer}>
                        <ProductSuggestions products={item.products} />
                    </View>
                )}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: verticalScale(5),
        maxWidth: '80%',
        alignSelf: 'flex-start',
    },
    userMessageContainer: {
        alignSelf: 'flex-end'
    },
    aiMessageContainer: {
        alignSelf: 'flex-start'
    },
    messageContainerWithProducts: {
        maxWidth: '95%',
        minWidth: '70%',
    },
    messageBubble: {
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(18),
        alignSelf: 'flex-start',
    },
    userMessageBubble: {
        backgroundColor: theme.colors.userBubble,
        borderWidth: 1,
        borderColor: '#E6C200', // Viền vàng đậm hơn
    },
    aiMessageBubble: {
        backgroundColor: theme.colors.aiBubble,
        borderWidth: 1,
        borderColor: '#E0E0E0', // Viền xám nhạt
    },
    messageBubbleWithProducts: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(8),
    },
    userMessageText: {
        color: theme.colors.userText,
        fontSize: moderateScale(15),
        lineHeight: moderateScale(20),
    },
    aiMessageText: {
        color: theme.colors.aiText,
        fontSize: moderateScale(15),
        lineHeight: moderateScale(20),
    },
    messageImage: {
        width: scale(200),
        height: verticalScale(150),
        borderRadius: moderateScale(8),
        marginBottom: verticalScale(8)
    },
    productContainer: {
        marginTop: verticalScale(5),
        width: '100%',
        overflow: 'hidden',
    },
});

export default MessageItem;
