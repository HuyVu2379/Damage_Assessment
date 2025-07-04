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
                    size={moderateScale(24)}
                    color="rgba(0,0,0,0.7)"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    previewContainer: {
        padding: moderateScale(10),
        backgroundColor: '#f0f0f0',
        borderTopWidth: 1,
        borderColor: '#ddd'
    },
    previewImage: {
        width: scale(80),
        height: scale(80),
        borderRadius: moderateScale(8)
    },
    removeImageButton: {
        position: 'absolute',
        top: 0,
        right: 0
    },
});

export default ImagePreview;
