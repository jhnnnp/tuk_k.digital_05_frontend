import { StyleSheet } from 'react-native';

const ModalStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        minWidth: 350,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        paddingTop: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        alignSelf: 'center',
    },
});

export default ModalStyles; 