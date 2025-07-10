import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

const VoiceFeedback = ({ isVisible, message, type = 'success' }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        if (isVisible) {
            // Fade in and slide up
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after 2 seconds
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 50,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 2000);
        }
    }, [isVisible, fadeAnim, slideAnim]);

    if (!isVisible) return null;

    const backgroundColor = type === 'success' ? '#00aa00' : type === 'warning' ? '#ff8800' : '#ff4444';

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: -verticalScale(50),
        left: '50%',
        transform: [{ translateX: -scale(75) }],
        width: scale(150),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(20),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    message: {
        color: 'white',
        fontSize: moderateScale(12),
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default VoiceFeedback;
