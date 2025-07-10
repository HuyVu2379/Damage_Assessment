import React, { memo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display'; // <<<--- 1. Import thư viện Markdown
import { moderateScale, verticalScale, scale } from '../utils/scaling';
import { theme } from '../utils/theme';
import ProductSuggestions from './ProductSuggestions';

const MessageItem = ({ item, index }) => {
    if (item.role === 'system') return null;

    const isUserMessage = item.role === 'user';
    const hasProducts = !isUserMessage && item.products && item.products.length > 0;

    // <<<--- 2. Định nghĩa style cho các thẻ Markdown ---<<<
    // Thêm style cho thẻ in đậm (bold) và văn bản thường (body)
    const markdownStyles = {
        body: {
            fontSize: moderateScale(15),
            lineHeight: moderateScale(20),
            color: isUserMessage ? theme.colors.userText : theme.colors.aiText,
            fontFamily: 'System',
        },
        strong: {
            fontWeight: 'bold',
            color: isUserMessage ? theme.colors.userText : theme.colors.aiText,
        },
        emphasis: {
            fontStyle: 'italic',
            color: isUserMessage ? theme.colors.userText : theme.colors.aiText,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: moderateScale(5),
        },
    };

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
                    // <<<--- 3. Thay thế <Text> bằng <Markdown> ---<<<
                    // Component này sẽ tự động tìm và in đậm các chuỗi như **text**
                    <Markdown style={markdownStyles}>
                        {item.content}
                    </Markdown>
                )}

                {hasProducts && (
                    <View style={styles.productContainer}>
                        <ProductSuggestions products={item.products} />
                    </View>
                )}
            </View>
        </View>
    );
};

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
        borderColor: '#E6C200',
    },
    aiMessageBubble: {
        backgroundColor: theme.colors.aiBubble,
        borderWidth: 1,
        borderColor: '#E0E0E0',
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

const areEqual = (prevProps, nextProps) => {
    return (
        prevProps.item.role === nextProps.item.role &&
        prevProps.item.content === nextProps.item.content &&
        prevProps.item.imageUri === nextProps.item.imageUri &&
        prevProps.index === nextProps.index &&
        JSON.stringify(prevProps.item.products) === JSON.stringify(nextProps.item.products)
    );
};

export default memo(MessageItem, areEqual);