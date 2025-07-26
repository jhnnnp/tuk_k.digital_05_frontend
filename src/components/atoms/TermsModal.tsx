import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

export default function TermsModal({ visible, onClose, title, content }: TermsModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contentWrapper}>
                        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                            <Text style={styles.content}>{content}</Text>
                        </ScrollView>
                    </View>
                    <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
                        <Text style={styles.confirmText}>확인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '85%',
        maxWidth: 350,
        maxHeight: '75%',
        minHeight: 400,
        padding: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: 'bold',
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    content: {
        fontSize: 14,
        lineHeight: 24,
        color: '#374151',
        textAlign: 'left',
    },
    confirmButton: {
        backgroundColor: '#29588A',
        paddingVertical: 14,
        marginHorizontal: 16,
        marginBottom: 16,
        marginTop: 8,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 