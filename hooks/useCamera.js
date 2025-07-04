import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';

export const useCamera = (setPickedImage) => {
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền', 'Cần cấp quyền truy cập thư viện.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setPickedImage(result.assets[0].uri);
        }
    };

    const openCamera = async () => {
        if (!permission?.granted) {
            const permissionResult = await requestPermission();
            if (!permissionResult.granted) {
                Alert.alert('Cần quyền', 'Cần cấp quyền truy cập camera.');
                return;
            }
        }
        setIsCameraVisible(true);
    };

    const takePicture = async (cameraRef) => {
        if (cameraRef) {
            try {
                const photo = await cameraRef.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });
                setPickedImage(photo.uri);
                setIsCameraVisible(false);
            } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Lỗi', 'Không thể chụp ảnh.');
            }
        }
    };

    return {
        isCameraVisible,
        setIsCameraVisible,
        openCamera,
        takePicture,
        pickImage
    };
};
