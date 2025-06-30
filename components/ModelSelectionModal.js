import React from 'react';
import { View, Text, Modal, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { moderateScale, verticalScale } from '../utils/scaling';

const ModelSelectionModal = ({
    visible,
    onClose,
    onSelectModel,
    selectedModel
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Chọn Model AI</Text>

                    <TouchableOpacity
                        onPress={() => onSelectModel('groq')}
                        style={[styles.modalButton, selectedModel === 'groq' && styles.selectedButton]}
                    >
                        <Text style={[styles.buttonText, selectedModel === 'groq' && styles.selectedButtonText]}>
                            Groq (Llama3)
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSelectModel('gemini')}
                        style={[styles.modalButton, selectedModel === 'gemini' && styles.selectedButton]}
                    >
                        <Text style={[styles.buttonText, selectedModel === 'gemini' && styles.selectedButtonText]}>
                            Gemini (Flash)
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeButtonText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: moderateScale(20),
        padding: moderateScale(25),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        marginBottom: moderateScale(20),
    },
    modalButton: {
        width: '100%',
        paddingVertical: verticalScale(15),
        paddingHorizontal: moderateScale(20),
        marginBottom: verticalScale(10),
        backgroundColor: '#e0e0e0',
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: '#6200EE',
    },
    buttonText: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        color: '#333',
    },
    selectedButtonText: {
        color: 'white',
    },
    closeButton: {
        marginTop: moderateScale(10),
        paddingVertical: verticalScale(10),
        paddingHorizontal: moderateScale(20),
    },
    closeButtonText: {
        fontSize: moderateScale(16),
        color: '#6200EE',
        fontWeight: '500',
    },
});

export default ModelSelectionModal;
