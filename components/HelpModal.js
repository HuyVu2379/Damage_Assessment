import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Linking,
    Alert,
    ScrollView,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { moderateScale, verticalScale, scale } from '../utils/scaling';

const HelpModal = ({ visible, onClose, theme }) => {
    const handleEmailPress = () => {
        const email = 'giahuy070903@gmail.com';
        Linking.openURL(`mailto:${email}`)
            .catch(() => {
                Alert.alert(
                    'Không thể mở ứng dụng email',
                    `Vui lòng gửi email đến: ${email}`,
                    [{ text: 'OK' }]
                );
            });
    };

    const handleMomoPress = () => {
        const momoNumber = '0979790252';
        Alert.alert(
            'Ủng hộ cafe',
            `Số Momo: ${momoNumber}\n\nCảm ơn bạn đã ủng hộ các tác giả!`,
            [
                {
                    text: 'Sao chép số',
                    onPress: () => {
                        // Có thể thêm Clipboard.setString(momoNumber) nếu có clipboard
                        Alert.alert('Thông báo', 'Đã sao chép số Momo!');
                    }
                },
                { text: 'Đóng' }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                            Trợ giúp
                        </Text>
                        <IconButton
                            icon="close"
                            size={24}
                            iconColor={theme.colors.onSurface}
                            onPress={onClose}
                        />
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Liên hệ */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <IconButton
                                    icon="email-outline"
                                    size={24}
                                    iconColor={theme.colors.primary}
                                />
                                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                                    Liên hệ hỗ trợ
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.contactItem, { borderColor: theme.colors.outline }]}
                                onPress={handleEmailPress}
                            >
                                <Text style={[styles.contactLabel, { color: theme.colors.onSurfaceVariant }]}>
                                    Mọi thắc mắc liên hệ:
                                </Text>
                                <Text style={[styles.contactValue, { color: theme.colors.primary }]}>
                                    giahuy070903@gmail.com
                                </Text>
                                <IconButton
                                    icon="open-in-new"
                                    size={16}
                                    iconColor={theme.colors.primary}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Ủng hộ */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <IconButton
                                    icon="coffee-outline"
                                    size={24}
                                    iconColor={theme.colors.secondary}
                                />
                                <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                                    Ủng hộ tác giả
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.contactItem, { borderColor: theme.colors.outline }]}
                                onPress={handleMomoPress}
                            >
                                <Text style={[styles.contactLabel, { color: theme.colors.onSurfaceVariant }]}>
                                    Ủng hộ cafe cho các tác giả:
                                </Text>
                                <Text style={[styles.contactValue, { color: theme.colors.secondary }]}>
                                    0979790252 Momo
                                </Text>
                                <IconButton
                                    icon="content-copy"
                                    size={16}
                                    iconColor={theme.colors.secondary}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Thông tin thêm */}
                        <View style={styles.section}>
                            <Text style={[styles.thankYouText, { color: theme.colors.onSurfaceVariant }]}>
                                Cảm ơn bạn đã sử dụng ứng dụng! 
                                {'\n'}Mọi góp ý và hỗ trợ đều được chúng tôi trân trọng.
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        maxHeight: '80%',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(8),
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(16),
    },
    section: {
        marginBottom: verticalScale(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: '600',
        marginLeft: scale(8),
    },
    contactItem: {
        borderWidth: 1,
        borderRadius: 12,
        padding: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    contactLabel: {
        fontSize: moderateScale(14),
        flex: 1,
        marginRight: scale(8),
    },
    contactValue: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginRight: scale(8),
    },
    thankYouText: {
        fontSize: moderateScale(14),
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
});

export default HelpModal;
