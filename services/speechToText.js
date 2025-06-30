// speechToText.js - Utility để chuyển đổi audio thành text

import * as FileSystem from 'expo-file-system';

/**
 * Chuyển đổi file audio thành text sử dụng Google Speech-to-Text API
 * @param {string} audioUri - URI của file audio đã thu âm
 * @returns {Promise<string>} - Text được chuyển đổi
 */
export const convertAudioToText = async (audioUri) => {
    try {
        // Đọc file audio dưới dạng base64
        const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Tạm thời trả về placeholder text
        // Bạn có thể tích hợp với Google Speech-to-Text API hoặc Azure Speech Services
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("Đây là text được chuyển đổi từ âm thanh (demo)");
            }, 1000);
        });

        // Để tích hợp thật với Google Speech-to-Text API, bạn có thể làm như sau:
        /*
        const response = await fetch('https://speech.googleapis.com/v1/speech:recognize?key=YOUR_API_KEY', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS', // hoặc định dạng phù hợp
              sampleRateHertz: 48000,
              languageCode: 'vi-VN',
            },
            audio: {
              content: audioBase64,
            },
          }),
        });
    
        const result = await response.json();
        return result.results[0]?.alternatives[0]?.transcript || "Không thể nhận diện được âm thanh";
        */

    } catch (error) {
        console.error('Error converting audio to text:', error);
        throw new Error('Không thể chuyển đổi âm thanh thành text');
    }
};

/**
 * Kiểm tra và cài đặt permissions cho audio recording
 */
export const requestAudioPermissions = async () => {
    try {
        const { Audio } = require('expo-av');
        const permission = await Audio.requestPermissionsAsync();
        return permission.status === 'granted';
    } catch (error) {
        console.error('Error requesting audio permissions:', error);
        return false;
    }
};
