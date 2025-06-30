import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { moderateScale, verticalScale } from '../utils/scaling';

const Header = ({ selectedModel, onOpenModal, theme }) => {
    return (
        <View style={styles.header}>
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
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
});

export default Header;
