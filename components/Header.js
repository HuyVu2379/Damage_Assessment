import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

const Header = ({ selectedModel, onOpenModal, onNewChat, theme }) => {
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

            <Button
                onPress={onOpenModal}
                icon="robot"
                mode="contained"
                color={theme.colors.primary}
                labelStyle={{ fontSize: moderateScale(12) }}
            >
                Model: {selectedModel}
            </Button>
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
    },
    iconButton: {
        margin: 0,
        marginRight: scale(5),
    },
});

export default Header;
