import { useState, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import Voice from '@react-native-voice/voice';

export const useVoiceRecognition = (setInputText, setIsLoading) => {
    const [isListening, setIsListening] = useState(false);
    const [partialResults, setPartialResults] = useState([]);
    const [finalResults, setFinalResults] = useState([]);

    useEffect(() => {
        // Setup Voice event listeners
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechRecognized = onSpeechRecognized;
        Voice.onSpeechEnd = onSpeechEnd;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechPartialResults = onSpeechPartialResults;

        return () => {
            // Cleanup
            Voice.destroy().then(() => {
                Voice.removeAllListeners();
            }).catch(error => {
                console.warn('Error during Voice cleanup:', error);
            });
        };
    }, []);

    const requestMicrophonePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: 'Quyền truy cập microphone',
                        message: 'Ứng dụng cần quyền truy cập microphone để nhận diện giọng nói',
                        buttonNeutral: 'Hỏi lại sau',
                        buttonNegative: 'Từ chối',
                        buttonPositive: 'Đồng ý',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Error requesting microphone permission:', err);
                return false;
            }
        }
        return true;
    };

    const onSpeechStart = () => {
        setIsListening(true);
        setPartialResults([]);
        setFinalResults([]);
        setIsLoading && setIsLoading(true);
    };

    const onSpeechRecognized = () => {
        // Speech has been recognized
    };

    const onSpeechEnd = () => {
        setIsListening(false);
        setIsLoading && setIsLoading(false);
    };

    const onSpeechError = (error) => {
        console.warn('Speech recognition error:', error);
        setIsListening(false);
        setIsLoading && setIsLoading(false);

        let errorMessage = 'Có lỗi khi nhận diện giọng nói';
        switch (error.error?.code) {
            case '2':
                errorMessage = 'Không nhận diện được âm thanh, vui lòng thử lại';
                break;
            case '7':
                errorMessage = 'Không có kết nối internet';
                break;
            case '9':
                errorMessage = 'Thiếu quyền microphone';
                break;
            default:
                errorMessage = error.error?.message || 'Lỗi không xác định';
        }

        Alert.alert('Lỗi nhận diện giọng nói', errorMessage);
    };

    const onSpeechResults = (event) => {
        const results = event.value;
        setFinalResults(results);

        if (results && results.length > 0) {
            const recognizedText = results[0];
            setInputText(recognizedText);
            setIsLoading && setIsLoading(false);
        }
    };

    const onSpeechPartialResults = (event) => {
        const partialResults = event.value;
        setPartialResults(partialResults);
    };

    const startListening = async () => {
        try {
            // Request microphone permission
            const hasPermission = await requestMicrophonePermission();
            if (!hasPermission) {
                Alert.alert('Lỗi', 'Cần quyền truy cập microphone để nhận diện giọng nói');
                return;
            }

            // Check if voice recognition is available
            const isAvailable = await Voice.isAvailable();
            if (!isAvailable) {
                Alert.alert('Lỗi', 'Thiết bị không hỗ trợ nhận diện giọng nói');
                return;
            }

            // Start voice recognition
            setIsLoading && setIsLoading(true);
            await Voice.start('vi-VN'); // Vietnamese language
        } catch (error) {
            console.warn('Error starting voice recognition:', error);
            Alert.alert('Lỗi', 'Không thể bắt đầu nhận diện giọng nói');
            setIsLoading && setIsLoading(false);
        }
    };

    const stopListening = async () => {
        try {
            await Voice.stop();
        } catch (error) {
            console.warn('Error stopping voice recognition:', error);
        }
    };

    const cancelListening = async () => {
        try {
            await Voice.cancel();
            setIsListening(false);
            setIsLoading && setIsLoading(false);
            setPartialResults([]);
            setFinalResults([]);
        } catch (error) {
            console.warn('Error canceling voice recognition:', error);
        }
    };

    return {
        isListening,
        partialResults,
        finalResults,
        startListening,
        stopListening,
        cancelListening
    };
};
