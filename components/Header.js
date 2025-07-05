import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

const Header = ({ onNewChat, isDamageMode, onToggleDamageMode, theme }) => {
    return (
        <View style={styles.header}>
            <View style={styles.leftActions}>
                <IconButton
                    icon="menu"
                    size={24}
                    onPress={onNewChat}
                    style={styles.iconButton}
                />
            </View>

            <View style={styles.centerActions}>
                {/* Khu vực giữa để trống hoặc có thể thêm title */}
            </View>

            <View style={styles.rightActions}>
                <IconButton
                    icon={isDamageMode ? "hammer-wrench" : "chat"}
                    size={20}
                    onPress={onToggleDamageMode}
                    style={[
                        styles.toggleButton,
                        isDamageMode && styles.toggleButtonActive
                    ]}
                    iconColor={isDamageMode ? '#fff' : theme.colors.primary}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: verticalScale(15),
        paddingBottom: verticalScale(10),
        paddingHorizontal: scale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        width: scale(60),
    },
    centerActions: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        width: scale(60),
        justifyContent: 'flex-end',
    },
    toggleButton: {
        margin: 0,
        borderRadius: moderateScale(20),
        backgroundColor: 'transparent',
    },
    toggleButtonActive: {
        backgroundColor: '#FF6B35',
    },
    iconButton: {
        margin: 0,
        marginRight: scale(5),
    },
});

export default Header;
