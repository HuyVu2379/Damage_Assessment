import { Platform } from 'react-native';

// Voice module wrapper để đảm bảo safe access
class VoiceWrapper {
    constructor() {
        this.voice = null;
        this.isInitialized = false;

        // Chỉ khởi tạo Voice trên native platforms
        if (Platform.OS !== 'web') {
            try {
                this.voice = require('@react-native-voice/voice').default;
                this.isInitialized = true;
            } catch (error) {
                console.warn('Voice module not available:', error);
                this.isInitialized = false;
            }
        }
    }

    // Safe wrapper methods
    isAvailable() {
        if (!this.isInitialized || !this.voice) {
            return Promise.resolve(false);
        }
        try {
            return this.voice.isAvailable();
        } catch (error) {
            console.warn('Voice.isAvailable error:', error);
            return Promise.resolve(false);
        }
    }

    start(locale) {
        if (!this.isInitialized || !this.voice) {
            return Promise.reject(new Error('Voice not available'));
        }
        try {
            return this.voice.start(locale);
        } catch (error) {
            console.warn('Voice.start error:', error);
            return Promise.reject(error);
        }
    }

    stop() {
        if (!this.isInitialized || !this.voice) {
            return Promise.resolve();
        }
        try {
            return this.voice.stop();
        } catch (error) {
            console.warn('Voice.stop error:', error);
            return Promise.resolve();
        }
    }

    cancel() {
        if (!this.isInitialized || !this.voice) {
            return Promise.resolve();
        }
        try {
            return this.voice.cancel();
        } catch (error) {
            console.warn('Voice.cancel error:', error);
            return Promise.resolve();
        }
    }

    destroy() {
        if (!this.isInitialized || !this.voice) {
            return Promise.resolve();
        }
        try {
            return this.voice.destroy();
        } catch (error) {
            console.warn('Voice.destroy error:', error);
            return Promise.resolve();
        }
    }

    removeAllListeners() {
        if (!this.isInitialized || !this.voice) {
            return;
        }
        try {
            return this.voice.removeAllListeners();
        } catch (error) {
            console.warn('Voice.removeAllListeners error:', error);
        }
    }

    // Event setters với safe checks
    set onSpeechStart(handler) {
        if (this.isInitialized && this.voice) {
            try {
                this.voice.onSpeechStart = handler;
            } catch (error) {
                console.warn('Voice.onSpeechStart setter error:', error);
            }
        }
    }

    set onSpeechRecognized(handler) {
        if (this.isInitialized && this.voice) {
            try {
                this.voice.onSpeechRecognized = handler;
            } catch (error) {
                console.warn('Voice.onSpeechRecognized setter error:', error);
            }
        }
    }

    set onSpeechEnd(handler) {
        if (this.isInitialized && this.voice) {
            try {
                this.voice.onSpeechEnd = handler;
            } catch (error) {
                console.warn('Voice.onSpeechEnd setter error:', error);
            }
        }
    }

    set onSpeechError(handler) {
        if (this.isInitialized && this.voice) {
            try {
                this.voice.onSpeechError = handler;
            } catch (error) {
                console.warn('Voice.onSpeechError setter error:', error);
            }
        }
    }

    set onSpeechResults(handler) {
        if (this.isInitialized && this.voice) {
            try {
                this.voice.onSpeechResults = handler;
            } catch (error) {
                console.warn('Voice.onSpeechResults setter error:', error);
            }
        }
    }

    set onSpeechPartialResults(handler) {
        if (this.isInitialized && this.voice) {
            try {
                this.voice.onSpeechPartialResults = handler;
            } catch (error) {
                console.warn('Voice.onSpeechPartialResults setter error:', error);
            }
        }
    }
}

// Tạo instance duy nhất
const voiceWrapper = new VoiceWrapper();

export default voiceWrapper;
