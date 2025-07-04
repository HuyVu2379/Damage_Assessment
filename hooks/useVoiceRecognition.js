import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import VoiceWrapper from '../utils/VoiceWrapper';

export const useVoiceRecognition = (setInputText, setIsLoading) => {
    const [isListening, setIsListening] = useState(false);
    const [partialResults, setPartialResults] = useState([]);
    const [finalResults, setFinalResults] = useState([]);
    const [webRecognition, setWebRecognition] = useState(null);

    // *** BẮT ĐẦU CẬP NHẬT useEffect ***
    useEffect(() => {
        // --- Di chuyển tất cả các hàm xử lý sự kiện vào bên trong useEffect ---
        const onSpeechStart = (e) => {
            console.log('Speech recognition started', e);
            setIsListening(true);
            setIsLoading(true);
            setPartialResults([]);
            setFinalResults([]);
        };

        const onSpeechRecognized = (e) => {
            console.log('Speech recognized', e);
        };

        const onSpeechEnd = (e) => {
            console.log('Speech recognition ended', e);
            setIsListening(false);
            setIsLoading(false);
        };

        const onSpeechError = (e) => {
            console.log('Speech recognition error', e);
            setIsListening(false);
            setIsLoading(false);

            let errorMessage = 'Có lỗi khi nhận diện giọng nói';
            switch (e.error?.code) {
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
                    errorMessage = `Lỗi nhận diện: ${e.error?.message || 'Không xác định'}`;
            }
            Alert.alert('Lỗi nhận diện giọng nói', errorMessage);
        };

        const onSpeechResults = (e) => {
            console.log('Speech results', e);
            setFinalResults(e.value);
            if (e.value && e.value.length > 0) {
                setInputText(e.value[0]);
                Alert.alert('Thành công', 'Đã nhận diện giọng nói thành công!');
            }
        };

        const onSpeechPartialResults = (e) => {
            console.log('Partial results', e);
            setPartialResults(e.value);
        };
        // --- Kết thúc di chuyển ---

        const initializeWebSpeechAPI = () => {
            if (typeof window !== 'undefined') {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.lang = 'vi-VN';

                    recognition.onstart = () => onSpeechStart({});
                    recognition.onend = () => onSpeechEnd({});
                    recognition.onerror = (event) => onSpeechError({ error: { message: event.error } });
                    recognition.onresult = (event) => {
                        const results = [];
                        const partialResults = [];
                        for (let i = 0; i < event.results.length; i++) {
                            const transcript = event.results[i][0].transcript;
                            if (event.results[i].isFinal) {
                                results.push(transcript);
                            } else {
                                partialResults.push(transcript);
                            }
                        }
                        if (results.length > 0) onSpeechResults({ value: results });
                        if (partialResults.length > 0) onSpeechPartialResults({ value: partialResults });
                    };
                    setWebRecognition(recognition);
                }
            }
        };

        if (Platform.OS === 'web') {
            initializeWebSpeechAPI();
        } else {
            try {
                VoiceWrapper.onSpeechStart = onSpeechStart;
                VoiceWrapper.onSpeechRecognized = onSpeechRecognized;
                VoiceWrapper.onSpeechEnd = onSpeechEnd;
                VoiceWrapper.onSpeechError = onSpeechError;
                VoiceWrapper.onSpeechResults = onSpeechResults;
                VoiceWrapper.onSpeechPartialResults = onSpeechPartialResults;
            } catch (error) {
                console.warn('Error setting up Voice listeners:', error);
            }
        }

        return () => {
            if (Platform.OS === 'web' && webRecognition) {
                try {
                    webRecognition.stop();
                } catch (error) {
                    console.warn('Error stopping web recognition:', error);
                }
            } else {
                try {
                    VoiceWrapper.destroy().then(() => {
                        VoiceWrapper.removeAllListeners();
                    }).catch(error => {
                        console.warn('Error during Voice cleanup:', error);
                    });
                } catch (error) {
                    console.warn('Error destroying Voice:', error);
                }
            }
        };
    // *** Cập nhật mảng phụ thuộc của useEffect ***
    }, [webRecognition, setInputText, setIsLoading]);

    // Các hàm start/stop/cancel không thay đổi, nhưng nên được bọc trong useCallback để tối ưu
    const startListening = useCallback(async () => {
        try {
            if (Platform.OS === 'web') {
                if (!webRecognition) {
                    Alert.alert('Lỗi', 'Trình duyệt không hỗ trợ nhận diện giọng nói');
                    return;
                }
                if (isListening) {
                    await stopListening();
                    return;
                }
                webRecognition.start();
            } else {
                const isAvailable = await VoiceWrapper.isAvailable();
                if (!isAvailable) {
                    Alert.alert('Lỗi', 'Thiết bị không hỗ trợ nhận diện giọng nói');
                    return;
                }
                if (isListening) {
                    await stopListening();
                    return;
                }
                await VoiceWrapper.start('vi-VN');
            }
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            Alert.alert('Lỗi', 'Không thể bắt đầu nhận diện giọng nói');
        }
    }, [isListening, webRecognition, stopListening]);

    const stopListening = useCallback(async () => {
        try {
            if (Platform.OS === 'web' && webRecognition) {
                webRecognition.stop();
            } else {
                await VoiceWrapper.stop();
            }
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
        }
    }, [webRecognition]);

    const cancelListening = useCallback(async () => {
        try {
            if (Platform.OS === 'web' && webRecognition) {
                webRecognition.abort();
            } else {
                await VoiceWrapper.cancel();
            }
        } catch (error) {
            console.error('Error canceling voice recognition:', error);
        }
    }, [webRecognition]);


    return {
        isListening,
        partialResults,
        finalResults,
        startListening,
        stopListening,
        cancelListening
    };
};