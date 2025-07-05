import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

const Header = ({ onNewChat, theme }) => {
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
                <Text style={styles.title}>🏗️ AI Xây Dựng</Text>
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
    title: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#333',
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
