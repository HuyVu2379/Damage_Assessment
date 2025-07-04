import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

const VoiceTestScreen = () => {
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        isListening,
        partialResults,
        finalResults,
        startListening,
        stopListening,
        cancelListening
    } = useVoiceRecognition(setInputText, setIsLoading);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Voice Recognition Test</Text>

            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Status: {isListening ? 'Đang nghe...' : 'Chưa bắt đầu'}
                </Text>
                {isLoading && <Text style={styles.loadingText}>Đang xử lý...</Text>}
            </View>

            {partialResults.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Kết quả tạm thời:</Text>
                    <Text style={styles.resultsText}>{partialResults[0]}</Text>
                </View>
            )}

            {finalResults.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Kết quả cuối cùng:</Text>
                    <Text style={styles.resultsText}>{finalResults[0]}</Text>
                </View>
            )}

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Text được nhận diện:</Text>
                <Text style={styles.inputText}>{inputText}</Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, isListening && styles.buttonActive]}
                    onPress={startListening}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isListening ? 'Dừng nghe' : 'Bắt đầu nghe'}
                    </Text>
                </TouchableOpacity>

                {isListening && (
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={cancelListening}
                    >
                        <Text style={styles.buttonText}>Hủy</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    statusContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 16,
        color: '#666',
    },
    loadingText: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 5,
    },
    resultsContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    resultsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    resultsText: {
        fontSize: 16,
        color: '#007AFF',
    },
    inputContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 30,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    inputText: {
        fontSize: 16,
        color: '#333',
        minHeight: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        minWidth: 120,
    },
    buttonActive: {
        backgroundColor: '#FF6B6B',
    },
    cancelButton: {
        backgroundColor: '#FF9500',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default VoiceTestScreen;
