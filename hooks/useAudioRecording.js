import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import VoiceWrapper from '../utils/VoiceWrapper';

export const useAudioRecording = (setInputText, setIsLoading) => {
    const [isListening, setIsListening] = useState(false);
    const [partialResults, setPartialResults] = useState([]);
    const [finalResults, setFinalResults] = useState([]);
    const [webRecognition, setWebRecognition] = useState(null);

    useEffect(() => {
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
            // ... (switch case xử lý lỗi)
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

        const initializeWebSpeechAPI = () => {
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
        };

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') {
                initializeWebSpeechAPI();
            }
        } else {
            VoiceWrapper.onSpeechStart = onSpeechStart;
            VoiceWrapper.onSpeechRecognized = onSpeechRecognized;
            VoiceWrapper.onSpeechEnd = onSpeechEnd;
            VoiceWrapper.onSpeechError = onSpeechError;
            VoiceWrapper.onSpeechResults = onSpeechResults;
            VoiceWrapper.onSpeechPartialResults = onSpeechPartialResults;
        }

        return () => {
            if (Platform.OS === 'web' && webRecognition) {
                webRecognition.stop();
            } else {
                VoiceWrapper.destroy().catch(e => console.error("destroy error", e));
            }
        };
    }, [webRecognition, setInputText, setIsLoading]);

    const stopRecording = useCallback(async () => {
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

    const startRecording = useCallback(async () => {
        if (isListening) {
            await stopRecording();
            return;
        }
        try {
            if (Platform.OS === 'web') {
                if (!webRecognition) return Alert.alert('Lỗi', 'Trình duyệt không hỗ trợ nhận diện giọng nói');
                webRecognition.start();
            } else {
                const isAvailable = await VoiceWrapper.isAvailable();
                if (!isAvailable) return Alert.alert('Lỗi', 'Thiết bị không hỗ trợ nhận diện giọng nói');
                await VoiceWrapper.start('vi-VN');
            }
        } catch (error) {
            console.error('Error starting voice recognition:', error);
        }
    }, [isListening, webRecognition, stopRecording]);

    const cancelRecording = useCallback(async () => {
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
    // *** ĐÃ THÊM CÁC PHỤ THUỘC CÒN THIẾU ***
    }, [webRecognition, setIsLoading, setIsListening, setPartialResults, setFinalResults]);

    return {
        isListening,
        isRecording: isListening,
        partialResults,
        finalResults,
        startRecording,
        stopRecording,
        cancelRecording,
    };
};