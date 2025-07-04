import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import VoiceWrapper from '../utils/VoiceWrapper';

export const useAudioRecording = (setInputText, setIsLoading) => {
    const [isListening, setIsListening] = useState(false);
    const [partialResults, setPartialResults] = useState([]);
    const [finalResults, setFinalResults] = useState([]);
    const [webRecognition, setWebRecognition] = useState(null);

    useEffect(() => {
        if (Platform.OS === 'web') {
            // Initialize Web Speech API for web
            initializeWebSpeechAPI();
        } else {
            // Setup Voice event listeners for native platforms
            try {
                VoiceWrapper.onSpeechStart = onSpeechStart;
                VoiceWrapper.onSpeechRecognized = onSpeechRecognized;
                VoiceWrapper.onSpeechEnd = onSpeechEnd;
                VoiceWrapper.onSpeechError = onSpeechError;
                VoiceWrapper.onSpeechResults = onSpeechResults;
                VoiceWrapper.onSpeechPartialResults = onSpeechPartialResults;
            } catch (error) {
                console.error('Error setting up Voice listeners:', error);
            }
        }

        return () => {
            // Cleanup
            if (Platform.OS === 'web' && webRecognition) {
                webRecognition.stop();
            } else {
                VoiceWrapper.destroy().then(() => {
                    VoiceWrapper.removeAllListeners();
                }).catch(error => {
                    console.error('Error during Voice cleanup:', error);
                });
            }
        };
    }, [webRecognition]);

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

                    if (results.length > 0) {
                        onSpeechResults({ value: results });
                    }
                    if (partialResults.length > 0) {
                        onSpeechPartialResults({ value: partialResults });
                    }
                };

                setWebRecognition(recognition);
            }
        }
    };

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
            const recognizedText = e.value[0];
            setInputText(recognizedText);
            Alert.alert('Thành công', 'Đã nhận diện giọng nói thành công!');
        }
    };

    const onSpeechPartialResults = (e) => {
        console.log('Partial results', e);
        setPartialResults(e.value);
    };

    const startRecording = async () => {
        try {
            if (Platform.OS === 'web') {
                // Web Speech API
                if (!webRecognition) {
                    Alert.alert('Lỗi', 'Trình duyệt không hỗ trợ nhận diện giọng nói');
                    return;
                }

                if (isListening) {
                    await stopRecording();
                    return;
                }

                console.log('Starting web speech recognition..');
                webRecognition.start();
            } else {
                // Native Voice module
                try {
                    const isAvailable = await VoiceWrapper.isAvailable();
                    if (!isAvailable) {
                        Alert.alert('Lỗi', 'Thiết bị không hỗ trợ nhận diện giọng nói');
                        return;
                    }

                    if (isListening) {
                        await stopRecording();
                        return;
                    }

                    console.log('Starting voice recognition..');
                    await VoiceWrapper.start('vi-VN');
                } catch (error) {
                    console.error('Voice API error:', error);
                    Alert.alert('Lỗi', 'Không thể truy cập Voice API');
                }
            }
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            Alert.alert('Lỗi', 'Không thể bắt đầu nhận diện giọng nói');
            setIsListening(false);
            setIsLoading(false);
        }
    };

    const stopRecording = async () => {
        try {
            if (Platform.OS === 'web' && webRecognition) {
                console.log('Stopping web speech recognition..');
                webRecognition.stop();
            } else {
                console.log('Stopping voice recognition..');
                await VoiceWrapper.stop();
            }
            setIsListening(false);
            setIsLoading(false);
        } catch (error) {
            console.error('Error stopping voice recognition:', error);
            setIsListening(false);
            setIsLoading(false);
        }
    };

    const cancelRecording = async () => {
        try {
            if (Platform.OS === 'web' && webRecognition) {
                webRecognition.abort();
            } else {
                await VoiceWrapper.cancel();
            }
            setIsListening(false);
            setIsLoading(false);
            setPartialResults([]);
            setFinalResults([]);
        } catch (error) {
            console.error('Error canceling voice recognition:', error);
        }
    };

    return {
        isListening,
        isRecording: isListening, // Alias for backward compatibility
        partialResults,
        finalResults,
        startRecording,
        stopRecording,
        cancelRecording
    };
};
