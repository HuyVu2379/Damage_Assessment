import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Deepgram API configuration
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || 'YOUR_DEEPGRAM_API_KEY';
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen';

class SpeechToTextService {
    constructor() {
        this.recording = null;
        this.isRecording = false;
        this.recordingUri = null;
    }

    // Request audio recording permissions
    async requestPermissions() {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                throw new Error('Permission to access microphone was denied');
            }
            return true;
        } catch (error) {
            console.error('Error requesting audio permissions:', error);
            return false;
        }
    }

    // Start recording audio
    async startRecording() {
        try {
            console.log('Starting recording...');

            // Request permissions
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                throw new Error('Microphone permission not granted');
            }

            // Set audio mode for recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Configure recording options
            const recordingOptions = {
                android: {
                    extension: '.wav',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 16000,
                },
                ios: {
                    extension: '.wav',
                    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 16000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
            };

            // Create and start recording
            this.recording = new Audio.Recording();
            await this.recording.prepareToRecordAsync(recordingOptions);
            await this.recording.startAsync();

            this.isRecording = true;
            console.log('Recording started successfully');

            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            this.isRecording = false;
            throw error;
        }
    }

    // Stop recording and get the audio file URI
    async stopRecording() {
        try {
            console.log('🛑 stopRecording called, current state:', {
                hasRecording: !!this.recording,
                isRecording: this.isRecording,
                recordingUri: this.recordingUri
            });

            if (!this.recording || !this.isRecording) {
                console.warn('⚠️ No active recording to stop');
                return null;
            }

            console.log('🛑 Stopping recording...');

            await this.recording.stopAndUnloadAsync();
            this.recordingUri = this.recording.getURI();
            this.isRecording = false;

            console.log('✅ Recording stopped successfully, URI:', this.recordingUri);
            return this.recordingUri;
        } catch (error) {
            console.error('❌ Error stopping recording:', error);
            this.isRecording = false;
            throw error;
        }
    }

    // Cancel recording
    async cancelRecording() {
        try {
            if (this.recording && this.isRecording) {
                await this.recording.stopAndUnloadAsync();
                this.isRecording = false;
                this.recordingUri = null;
                console.log('Recording cancelled');
            }
        } catch (error) {
            console.error('Error cancelling recording:', error);
        }
    }

    // Convert audio file to base64
    async convertAudioToBase64(audioUri) {
        try {
            const base64 = await FileSystem.readAsStringAsync(audioUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return base64;
        } catch (error) {
            console.error('Error converting audio to base64:', error);
            throw error;
        }
    }

    // Send audio to Deepgram Speech-to-Text API
    async transcribeAudio(audioUri) {
        try {
            console.log('🎤 Transcribing audio with Deepgram...');

            if (!audioUri) {
                throw new Error('No audio file to transcribe');
            }

            if (!DEEPGRAM_API_KEY || DEEPGRAM_API_KEY === 'YOUR_DEEPGRAM_API_KEY') {
                throw new Error('Deepgram API key is not configured');
            }

            // Read audio file as binary data
            console.log('📁 Reading audio file...');
            const audioData = await FileSystem.readAsStringAsync(audioUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert base64 to binary buffer
            const binaryData = atob(audioData);
            const buffer = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                buffer[i] = binaryData.charCodeAt(i);
            }
            console.log(`📊 Audio buffer size: ${buffer.length} bytes`);

            // Prepare Deepgram API request with Vietnamese language support
            const params = new URLSearchParams({
                'model': 'nova-2',
                'language': 'vi', // Vietnamese language code
                'smart_format': 'true',
                'punctuate': 'true',
                'diarize': 'false',
                'encoding': 'linear16',
                'sample_rate': '16000',
                'channels': '1'
            });

            const url = `${DEEPGRAM_API_URL}?${params.toString()}`;
            console.log('🌐 Sending request to Deepgram API...');

            // Make API request
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${DEEPGRAM_API_KEY}`,
                    'Content-Type': 'audio/wav',
                },
                body: buffer,
            });

            console.log(`📡 Deepgram response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new Error(`Deepgram API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('📝 Deepgram response received:', JSON.stringify(data, null, 2));

            // Extract transcribed text from Deepgram response
            if (data.results && data.results.channels && data.results.channels.length > 0) {
                const alternatives = data.results.channels[0].alternatives;
                if (alternatives && alternatives.length > 0) {
                    const transcript = alternatives[0].transcript;
                    console.log('✅ Deepgram transcription successful:', transcript);
                    return transcript;
                }
            }

            console.log('⚠️ No speech detected in audio');
            return '';
        } catch (error) {
            console.error('❌ Error transcribing audio with Deepgram:', error);
            throw error;
        }
    }

    // Clean up resources
    cleanup() {
        try {
            if (this.recording) {
                this.recording.stopAndUnloadAsync().catch(console.error);
                this.recording = null;
            }
            this.isRecording = false;
            this.recordingUri = null;
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Get recording status
    getRecordingStatus() {
        return {
            isRecording: this.isRecording,
            recordingUri: this.recordingUri,
        };
    }
}

export default new SpeechToTextService();
