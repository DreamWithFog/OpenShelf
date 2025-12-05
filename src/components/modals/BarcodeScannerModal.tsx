import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAppContext } from '../../context/AppContext';
import { lookupISBN, formatBookData } from '../../utils/isbnLookup';
import logger from '../../../logger';
import { Book, NewBook } from '../../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Theme {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  inputBackground: string;
  danger: string;
}

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onBookFound: (book: NewBook) => void;
}

// Robust ISBN validation
const validateISBN = (isbn: string): { valid: boolean; error?: string } => {
  // Remove spaces, hyphens, and convert to string
  const cleaned = isbn.replace(/[\s-]/g, '').trim();
  
  // Check if empty
  if (!cleaned) {
    return { valid: false, error: 'Please enter an ISBN' };
  }
  
  // Check if only contains digits and possibly 'X' at the end (for ISBN-10)
  if (!/^[\dX]+$/i.test(cleaned)) {
    return { valid: false, error: 'ISBN can only contain numbers' };
  }
  
  // Check length (must be 10 or 13 digits)
  if (cleaned.length !== 10 && cleaned.length !== 13) {
    return { valid: false, error: 'ISBN must be 10 or 13 digits' };
  }
  
  // ISBN-10 can end with X (representing 10)
  if (cleaned.length === 10 && /X/i.test(cleaned.slice(0, -1))) {
    return { valid: false, error: 'X can only be the last character' };
  }
  
  // ISBN-13 cannot contain X
  if (cleaned.length === 13 && /X/i.test(cleaned)) {
    return { valid: false, error: 'ISBN-13 cannot contain X' };
  }
  
  return { valid: true };
};

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ visible, onClose, onBookFound }) => {
  const { theme } = useAppContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualISBN, setManualISBN] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setShowManualInput(false);
      setManualISBN('');
      setErrorMessage('');
      if (!permission?.granted) {
        requestPermission();
      }
    }
  }, [visible, permission?.granted, requestPermission]);

  const showError = (message: string) => {
    setErrorMessage(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Fade in
    Animated.timing(errorOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 3 seconds
    setTimeout(() => {
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setErrorMessage('');
      });
    }, 3000);
  };

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned || isLoading) return;

    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    logger.log('Barcode scanned:', { type, data });

    setIsLoading(true);

    try {
      const bookData = await lookupISBN(data);

      if (bookData) {
        const formattedData = formatBookData(bookData);
        if (!formattedData) {
          Alert.alert('Error', 'Failed to format book data.');
          setIsLoading(false);
          return;
        }

        Alert.alert(
          'Book Found!',
          `${formattedData.title}\nby ${formattedData.author}`,
          [
            {
              text: 'Scan Different Book',
              onPress: () => {
                setScanned(false);
                setIsLoading(false);
              },
              style: 'cancel'
            },
            {
              text: 'Add This Book',
              onPress: () => {
                onBookFound(formattedData as NewBook);
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Book Not Found',
          `ISBN: ${data}\n\nCould not find book details for this ISBN. You can try again or enter details manually.`,
          [
            {
              text: 'Try Again',
              onPress: () => {
                setScanned(false);
                setIsLoading(false);
              }
            },
            {
              text: 'Enter Manually',
              onPress: () => {
                onClose();
              }
            }
          ]
        );
      }
    } catch (error: unknown) {
      logger.error('Error looking up ISBN:', error);
      Alert.alert(
        'Lookup Error',
        error instanceof Error ? error.message : 'There was an error looking up the book. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              setIsLoading(false);
            }
          }
        ]
      );
    }

    setIsLoading(false);
  };

  const toggleTorch = () => {
    setTorchOn(!torchOn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleManualEntry = () => {
    setShowManualInput(true);
    setErrorMessage('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleManualSubmit = async () => {
    const isbn = manualISBN.replace(/[\s-]/g, '').trim();
    
    // Validate ISBN format
    const validation = validateISBN(isbn);
    if (!validation.valid) {
      showError(validation.error || 'Invalid ISBN');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const bookData = await lookupISBN(isbn);
      if (bookData) {
        const formattedData = formatBookData(bookData);
        if (!formattedData) {
          setIsLoading(false);
          showError('Failed to format book data');
          return;
        }
        setShowManualInput(false);
        onBookFound(formattedData as NewBook);
        onClose();
      } else {
        setIsLoading(false);
        showError('Book not found in database');
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const errorMsg = error instanceof Error ? error.message : 'Network error. Please try again.';
      showError(errorMsg);
      logger.error('ISBN lookup error:', error);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
          <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={30} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.text }]}>Camera Permission</Text>

            <View style={{ width: 40 }} />
          </View>

          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.permissionText, { color: theme.text }]}>
              Camera access is required to scan ISBN barcodes
            </Text>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: theme.primary }]}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={onClose}
      >
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={30} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.text }]}>Scan ISBN Barcode</Text>

            <TouchableOpacity onPress={toggleTorch} style={styles.torchButton}>
              <Ionicons
                name={torchOn ? "flashlight" : "flashlight-outline"}
                size={26}
                color={torchOn ? theme.primary : theme.text}
              />
            </TouchableOpacity>
          </View>

          {/* Scanner */}
          <View style={styles.scannerContainer}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={torchOn}
              barcodeScannerSettings={{
                barcodeTypes: [
                  'ean13',
                  'ean8',
                  'code128',
                  'code39',
                  'upc_a',
                  'upc_e',
                ],
              }}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Scanning Frame */}
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame}>
                <View style={[styles.scannerCorner, styles.topLeft, { borderColor: theme.primary }]} />
                <View style={[styles.scannerCorner, styles.topRight, { borderColor: theme.primary }]} />
                <View style={[styles.scannerCorner, styles.bottomLeft, { borderColor: theme.primary }]} />
                <View style={[styles.scannerCorner, styles.bottomRight, { borderColor: theme.primary }]} />
              </View>

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFF" />
                  <Text style={styles.loadingText}>Looking up book...</Text>
                </View>
              )}
            </View>
          </View>

          {/* Instructions */}
          <View style={[styles.instructions, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.instructionText, { color: theme.text }]}>
              Position the ISBN barcode within the frame
            </Text>
            <Text style={[styles.instructionSubtext, { color: theme.textSecondary }]}>
              Usually found on the back cover of the book
            </Text>
          </View>

          {/* Manual Entry Option */}
          <TouchableOpacity
            style={[styles.manualButton, { backgroundColor: theme.primary }]}
            onPress={handleManualEntry}
            disabled={isLoading}
          >
            <Text style={styles.manualButtonText}>Enter ISBN Manually</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Manual ISBN Input Modal - Separate from camera modal */}
      <Modal
        visible={showManualInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowManualInput(false);
          setManualISBN('');
          setErrorMessage('');
        }}
        statusBarTranslucent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => {
              setShowManualInput(false);
              setManualISBN('');
              setErrorMessage('');
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Enter ISBN Manually
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Type the 10 or 13 digit ISBN number
              </Text>
      
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: errorMessage ? theme.danger : theme.border,
                    borderWidth: errorMessage ? 2 : 1,
                  }]}
                  placeholder="ISBN (e.g., 9780142410318)"
                  placeholderTextColor={theme.textSecondary}
                  value={manualISBN}
                  onChangeText={(text) => {
                    setManualISBN(text);
                    if (errorMessage) {
                      setErrorMessage('');
                      errorOpacity.setValue(0);
                    }
                  }}
                  keyboardType="numeric"
                  autoFocus={true}
                  maxLength={17}
                  editable={!isLoading}
                />
                
                {errorMessage && (
                  <Animated.View style={{ opacity: errorOpacity }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <Ionicons name="alert-circle" size={16} color={theme.danger} />
                      <Text style={[styles.errorText, { color: theme.danger, marginLeft: 6 }]}>
                        {errorMessage}
                      </Text>
                    </View>
                  </Animated.View>
                )}
      
                {isLoading && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={{ color: theme.textSecondary, marginLeft: 8, fontSize: 14 }}>
                      Searching...
                    </Text>
                  </View>
                )}
              </View>
      
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.border }]}
                  onPress={() => {
                    setShowManualInput(false);
                    setManualISBN('');
                    setErrorMessage('');
                  }}
                  disabled={isLoading}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
      
                <TouchableOpacity
                  style={[styles.modalButton, { 
                    backgroundColor: isLoading ? theme.border : theme.primary,
                    opacity: isLoading ? 0.6 : 1,
                  }]}
                  onPress={handleManualSubmit}
                  disabled={isLoading}
                >
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                    {isLoading ? 'Searching...' : 'Search'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    padding: 5,
  },
  torchButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.35,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  instructions: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    textAlign: 'center',
  },
  instructionSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  manualButton: {
    marginHorizontal: 30,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  manualButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalKeyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  modalOverlayTouchable: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
  modalContent: {
      width: '85%',
      maxWidth: 400,
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      marginBottom: 0, // Push up to avoid keyboard
    },
});

export default React.memo(BarcodeScannerModal);
