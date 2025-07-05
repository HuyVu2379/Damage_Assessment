import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { moderateScale, scale } from '../utils/scaling';

const ImagePreview = ({ imageUri, onRemove }) => {
    if (!imageUri) return null;

    return (
        <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={onRemove}>
                <IconButton
                    icon="close-circle"
                    size={moderateScale(20)}
                    iconColor="rgba(220,20,60,0.8)"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(15),
        paddingVertical: moderateScale(8),
        backgroundColor: '#FFFEF7', // Cùng màu nền app
        borderTopWidth: 1,
        borderColor: '#E8E8E8',
        marginBottom: moderateScale(5), // Tạo khoảng cách với input
    },
    previewImage: {
        width: scale(60),
        height: scale(60),
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#E8E8E8'
    },
    removeImageButton: {
        marginLeft: moderateScale(8),
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: moderateScale(12),
    },
});

export default ImagePreview;
