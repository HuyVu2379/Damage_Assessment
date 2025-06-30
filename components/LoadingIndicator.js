import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

const LoadingIndicator = ({ theme }) => (
    <View style={styles.aiMessageContainer}>
        <View style={[styles.messageBubble, styles.aiMessageBubble]}>
            <ActivityIndicator animating={true} color={theme.colors.primary} />
        </View>
    </View>
);

const styles = StyleSheet.create({
    aiMessageContainer: {
        alignSelf: 'flex-start'
    },
    messageBubble: {
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(18)
    },
    aiMessageBubble: {
        backgroundColor: '#E5E5EA'
    },
});

export default LoadingIndicator;
