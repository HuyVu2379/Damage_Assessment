import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import { convertAudioToText } from '../speechToText';

export const useAudioRecording = (setInputText, setIsLoading) => {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingUri, setRecordingUri] = useState(null);
    const [isRecordingUnloaded, setIsRecordingUnloaded] = useState(false);

    useEffect(() => {
        return () => {
            // Cleanup khi component unmount
            if (recording && !isRecordingUnloaded) {
                recording.stopAndUnloadAsync().catch((error) => {
                    console.log('Cleanup attempted, may have been already unloaded');
                });
            }
        };
    }, [recording, isRecordingUnloaded]);

    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            setIsRecordingUnloaded(false);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Lỗi', 'Không thể bắt đầu thu âm');
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording..');
        setIsRecording(false);
        if (!recording || isRecordingUnloaded) return;

        try {
            const uri = recording.getURI();
            console.log('Recording will be stopped and stored at', uri);

            await recording.stopAndUnloadAsync();
            setIsRecordingUnloaded(true);
            setRecordingUri(uri);
            setRecording(null);
            console.log('Recording stopped successfully');

            // Chuyển đổi audio thành text
            try {
                setIsLoading(true);
                const transcribedText = await convertAudioToText(uri);
                setInputText(transcribedText);
                setIsLoading(false);
                Alert.alert('Thành công', 'Đã chuyển đổi âm thanh thành text!');
            } catch (error) {
                setIsLoading(false);
                console.error('Error converting audio to text:', error);
                Alert.alert('Lỗi', 'Không thể chuyển đổi âm thanh thành text');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Lỗi', 'Có lỗi khi dừng thu âm');
            setIsLoading(false);
            setIsRecordingUnloaded(true);
            setRecording(null);
        }
    };

    return {
        recording,
        isRecording,
        recordingUri,
        startRecording,
        stopRecording
    };
};
