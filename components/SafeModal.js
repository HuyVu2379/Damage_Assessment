import React from 'react';
import { Modal as RNModal } from 'react-native';

// Wrapper component để tránh lỗi BackHandler với react-native-paper Modal
const SafeModal = ({ visible, onDismiss, children, ...props }) => {
    return (
        <RNModal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onDismiss}
            {...props}
        >
            {children}
        </RNModal>
    );
};

export default SafeModal;
