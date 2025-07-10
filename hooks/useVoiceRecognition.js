import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import speechToTextService from '../services/speechToText';

export const useVoiceRecognition = (setInputText, setIsLoading) => {
    const [isListening, setIsListening] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    useEffect(() => {
        // Cleanup function when component unmounts
        return () => {
            speechToTextService.cleanup();
        };
    }, []);

    const startListening = async () => {
        try {
            console.log('🎙️ Starting voice recognition...');
            setIsLoading && setIsLoading(true);
            setIsListening(true);

            const success = await speechToTextService.startRecording();
            if (!success) {
                throw new Error('Failed to start recording');
            }

            console.log('✅ Voice recording started successfully');
        } catch (error) {
            console.error('❌ Error starting voice recognition:', error);
            setIsListening(false);
            setIsLoading && setIsLoading(false);

            let errorMessage = 'Không thể bắt đầu ghi âm';
            if (error.message.includes('permission')) {
                errorMessage = 'Cần quyền truy cập microphone để ghi âm';
            }

            Alert.alert('Lỗi ghi âm', errorMessage);
        }
    };

    const stopListening = async () => {
        try {
            if (!isListening) {
                console.log('⚠️ Not currently listening, nothing to stop');
                return;
            }

            console.log('🛑 Stop requested - UI will update immediately');

            // Immediately update UI states for fast feedback
            setIsListening(false);
            setIsTranscribing(true);

            console.log('🛑 Stopping recording and starting transcription...');

            const audioUri = await speechToTextService.stopRecording();

            if (audioUri) {
                console.log('✅ Audio file ready, starting transcription...');
                // Transcribe the audio using Deepgram Speech-to-Text
                const transcript = await speechToTextService.transcribeAudio(audioUri);

                if (transcript && transcript.trim()) {
                    setInputText(transcript.trim());
                    console.log('✅ Transcription completed:', transcript);
                } else {
                    console.log('⚠️ Empty transcription result');
                    Alert.alert('Thông báo', 'Không nhận diện được giọng nói. Vui lòng thử lại.');
                }
            } else {
                console.log('❌ No audio URI returned from recording');
                Alert.alert('Lỗi', 'Không có dữ liệu âm thanh để xử lý.');
            }
        } catch (error) {
            console.error('❌ Error stopping voice recognition:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý âm thanh. Vui lòng thử lại.');
        } finally {
            setIsListening(false);
            setIsTranscribing(false);
            setIsLoading && setIsLoading(false);
            console.log('🏁 Voice recognition process completed');
        }
    };

    const cancelListening = async () => {
        try {
            await speechToTextService.cancelRecording();
            setIsListening(false);
            setIsTranscribing(false);
            setIsLoading && setIsLoading(false);
            console.log('Voice recognition cancelled');
        } catch (error) {
            console.error('Error canceling voice recognition:', error);
            setIsListening(false);
            setIsTranscribing(false);
            setIsLoading && setIsLoading(false);
        }
    };

    return {
        isListening,
        isTranscribing,
        startListening,
        stopListening,
        cancelListening,
    };
};
