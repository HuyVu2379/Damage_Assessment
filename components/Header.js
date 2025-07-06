import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

const Header = ({ onNewChat, theme }) => {
    return (
        <View style={[styles.header, { backgroundColor: theme.colors.header, borderBottomColor: theme.colors.outline }]}>
            <View style={styles.leftActions}>
                <IconButton
                    icon="menu"
                    size={24}
                    iconColor={theme.colors.headerText}
                    onPress={onNewChat}
                    style={styles.iconButton}
                />
            </View>

            <View style={styles.centerActions}>
                <Text style={[styles.title, { color: theme.colors.headerText }]}>🏗️ AI phát hiện lỗi công trình</Text>
            </View>

            <View style={styles.rightActions}>
                {/* Có thể thêm icon history hoặc setting sau */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: verticalScale(15),
        paddingBottom: verticalScale(12),
        paddingHorizontal: scale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 3,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4.65,
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
    title: {
        fontSize: moderateScale(17),
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        width: scale(60),
        justifyContent: 'flex-end',
    },
    iconButton: {
        margin: 0,
        marginRight: scale(5),
    },
});

export default Header;
