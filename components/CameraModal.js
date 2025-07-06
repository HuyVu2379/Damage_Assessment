import React from 'react';
import { View, Modal, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { CameraView } from 'expo-camera';
import { moderateScale, scale } from '../utils/scaling';

const CameraModal = ({
    visible,
    onClose,
    onTakePicture,
    onPickImage
}) => {
    let cameraRef = null;

    if (!visible) return null;

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    ref={(ref) => cameraRef = ref}
                    facing="back"
                />
                
                {/* Đặt controls bên ngoài CameraView với absolute positioning */}
                <View style={styles.cameraButtonContainer}>
                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={onClose}
                    >
                        <IconButton icon="close" size={moderateScale(30)} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={() => onTakePicture(cameraRef)}
                    >
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={onPickImage}
                    >
                        <IconButton icon="image" size={moderateScale(30)} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    cameraContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraButtonContainer: {
        position: 'absolute',
        bottom: moderateScale(50),
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: scale(50),
    },
    cameraButton: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButton: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    captureButtonInner: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(30),
        backgroundColor: 'white',
    },
});

export default CameraModal;
