// File: components/RenameModal.js

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Text, Modal } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { moderateScale } from '../utils/scaling'; // Giả sử bạn có file scaling này

const RenameModal = ({ visible, onClose, onSave, initialName = '' }) => {
  const [name, setName] = useState(initialName);
  const theme = useTheme(); // Lấy theme từ PaperProvider, hoặc định nghĩa màu mặc định

  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [visible, initialName]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        {/* Nhấn ra ngoài để đóng modal */}
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={[styles.modalContainer, { backgroundColor: '#333333' }]}>
          <Text style={styles.title}>Tên mới</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoFocus={true}
            style={styles.input}
            outlineColor="#888"
            activeOutlineColor="#FFFFFF"
            placeholder="Nhập tên cuộc trò chuyện"
            theme={{ 
              colors: { 
                text: '#FFFFFF', 
                placeholder: '#AAAAAA', 
                background: '#FFFFFF' 
              } 
            }}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>Đổi tên</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 350,
    padding: moderateScale(20),
    borderRadius: moderateScale(14),
  },
  title: {
    fontSize: moderateScale(16),
    marginBottom: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    width: '100%',
    marginBottom: moderateScale(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  button: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    marginLeft: moderateScale(10),
  },
  buttonText: {
    fontSize: moderateScale(14),
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
});

export default RenameModal;