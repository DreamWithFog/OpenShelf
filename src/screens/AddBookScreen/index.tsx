import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppContext } from '../../context/AppContext';
import useBookForm from './hooks/useBookForm';
import useImagePicker from './hooks/useImagePicker';
import { globalStyles } from '../../styles/globalStyles';
import { logger } from '../../../logger';

import {
  BasicInfoSection,
  CoverImageSection,
  FormatLanguageSection,
  ProgressTrackingSection,
  SeriesInfoSection,
  StatusSection,
  TagsSection,
  ISBNScannerButton,
  ISBNDisplay,
  FormatPickerModal,
  LanguagePickerModal,
  CustomLanguageModal,
  TrackingTypePickerModal,
  CollectionTypePickerModal
} from './components';

import { BarcodeScannerModal } from '../../components/modals';

type RootStackParamList = {
  AddBook: undefined;
  'My Bookshelf': { newBookId?: number; newBookIds?: number[] };
  BookDetail: { bookId: number };
};

type AddBookScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddBook'>;
type AddBookScreenRouteProp = RouteProp<RootStackParamList, 'AddBook'>;

interface AddBookScreenProps {
  navigation: AddBookScreenNavigationProp;
  route: AddBookScreenRouteProp;
}

const AddBookScreen: React.FC<AddBookScreenProps> = ({ navigation, route }) => {
  const { theme, db } = useAppContext();
  const insets: EdgeInsets = useSafeAreaInsets();
  
  // Batch mode states
  const [continueAdding, setContinueAdding] = useState<boolean>(false);
  const [copyDetails, setCopyDetails] = useState<boolean>(false);
  const [addedBooksInSession, setAddedBooksInSession] = useState<number[]>([]);
  
  // Modal states
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [showFormatPicker, setShowFormatPicker] = useState<boolean>(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showOriginalLanguagePicker, setShowOriginalLanguagePicker] = useState<boolean>(false);
  const [showCustomLanguageInput, setShowCustomLanguageInput] = useState<boolean>(false);
  const [showCustomOriginalLanguageInput, setShowCustomOriginalLanguageInput] = useState<boolean>(false);
  const [showTrackingPicker, setShowTrackingPicker] = useState<boolean>(false);
  const [showCollectionTypePicker, setShowCollectionTypePicker] = useState<boolean>(false);
  const [customLanguageInput, setCustomLanguageInput] = useState<string>('');
  const [customOriginalLanguageInput, setCustomOriginalLanguageInput] = useState<string>('');

  const {
    formState,
    dispatch,
    imagePreview,
    setImagePreview,
    isOptimizing,
    setIsOptimizing,
    existingTags,
    handleBookFound,
    handleSubmit: originalHandleSubmit,
    handleCoverUrlChange,
  } = useBookForm(db, navigation as any, continueAdding, copyDetails, addedBooksInSession, setAddedBooksInSession);

  const { isUploading, pickImage } = useImagePicker(dispatch as any, setImagePreview, setIsOptimizing);

  const handleContinueAddingToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContinueAdding(value);
    if (!value) {
      setCopyDetails(false); // Auto-disable copy when turning off continue
    }
  };

  const handleCopyDetailsToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopyDetails(value);
  };

  // Intercept back navigation to show multi-spotlight
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      logger.log('🔙 Navigation beforeRemove triggered');
      logger.log('📚 Books in session:', addedBooksInSession);
      
      if (addedBooksInSession.length > 0) {
        // Prevent default behavior
        e.preventDefault();
        
        logger.log('✨ Navigating to bookshelf with book IDs:', addedBooksInSession);
        
        // Remove the listener to avoid infinite loop
        unsubscribe();
        
        // Navigate with book IDs
        navigation.navigate('My Bookshelf', { newBookIds: addedBooksInSession });
      }
    });

    return unsubscribe;
  }, [navigation, addedBooksInSession]);

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[globalStyles.header, { backgroundColor: theme.background, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          onPress={() => {
            logger.log('📤 Back button pressed. Books in session:', addedBooksInSession);
            
            // If books were added, navigate with IDs
            if (addedBooksInSession.length > 0) {
              logger.log('📤 Navigating with book IDs:', addedBooksInSession);
              navigation.navigate('My Bookshelf', { newBookIds: addedBooksInSession });
            } else {
              logger.log('📤 No books in session, going back normally');
              navigation.goBack();
            }
          }}
          style={globalStyles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[globalStyles.headerTitle, { color: theme.text }]}>Add Book</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Batch Mode Toggles */}
      <View style={{
        backgroundColor: theme.cardBackground,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        {/* Continue Adding Toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>
              Continue adding books?
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
              Stay on this screen after saving
            </Text>
          </View>
          <Switch
            value={continueAdding}
            onValueChange={handleContinueAddingToggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Copy Details Toggle */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          opacity: continueAdding ? 1 : 0.5,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>
              Copy book details?
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
              Pre-fill next book with current details
            </Text>
          </View>
          <Switch
            value={copyDetails}
            onValueChange={handleCopyDetailsToggle}
            disabled={!continueAdding}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Session Counter */}
        {addedBooksInSession.length > 0 && (
          <View style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            alignItems: 'center',
          }}>
            <Text style={{ color: theme.primary, fontSize: 14, fontWeight: 'bold' }}>
              Books added this session: {addedBooksInSession.length}
            </Text>
          </View>
        )}
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ISBN Scanner Button */}
        <ISBNScannerButton onPress={() => setShowScanner(true)} theme={theme} />

        {/* ISBN Display */}
        {formState.isbn && <ISBNDisplay isbn={formState.isbn} source="Scanner" theme={theme} />}


        {/* Cover Image Section */}
        <CoverImageSection
          theme={theme}
          coverImage={imagePreview}
          coverUrl={formState.coverUrl || ''}
          pickImage={pickImage}
          removeImage={() => {
            setImagePreview(null);
            dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: '' });
            dispatch({ type: 'SET_FIELD', field: 'coverPath', value: '' });
          }}
          onCoverUrlChange={(url) => {
            dispatch({ type: 'SET_FIELD', field: 'coverUrl', value: url });
            handleCoverUrlChange(url);
          }}
        />

        {/* Basic Info Section */}
        <BasicInfoSection book={{...formState, rating: formState.rating || 0}} handleInputChange={(field, value) => dispatch({ type: 'SET_FIELD', field: field as any, value })} theme={theme} />

        {/* Series Info Section */}
        <SeriesInfoSection
          formState={formState}
          dispatch={dispatch}
          theme={theme}
          onOpenCollectionTypePicker={() => setShowCollectionTypePicker(true)}
        />

        {/* Format & Language Section */}
        <FormatLanguageSection
          book={formState}
          theme={theme}
          setShowFormatPicker={setShowFormatPicker}
          setShowLanguagePicker={setShowLanguagePicker}
          setShowOriginalLanguagePicker={setShowOriginalLanguagePicker}
        />

        {/* Progress Tracking Section */}
        <ProgressTrackingSection formState={formState} dispatch={dispatch} theme={theme} onShowTrackingPicker={() => setShowTrackingPicker(true)} />

        {/* Status Section */}
        <StatusSection formState={formState} dispatch={dispatch} theme={theme} />

        {/* Tags Section */}
        <TagsSection
          formState={formState}
          dispatch={dispatch}
          existingTags={existingTags}
          theme={theme}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 20,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={originalHandleSubmit}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
            {continueAdding ? 'Add Book & Continue' : 'Add Book'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <BarcodeScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onBookFound={handleBookFound as any}
      />

      <CollectionTypePickerModal
        visible={showCollectionTypePicker}
        onClose={() => setShowCollectionTypePicker(false)}
        onSelect={(type) => dispatch({ type: 'SET_FIELD', field: 'collectionType', value: type })}
        theme={theme}
      />

      <FormatPickerModal
        visible={showFormatPicker}
        onClose={() => setShowFormatPicker(false)}
        onSelect={(format) => dispatch({ type: 'SET_FIELD', field: 'format', value: format })}
        theme={theme}
      />

      <LanguagePickerModal
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        currentLanguage={formState.language}
        onSelect={(language) => dispatch({ type: 'SET_FIELD', field: 'language', value: language })}
        onSelectCustom={() => {
          setCustomLanguageInput('');
          setShowCustomLanguageInput(true);
        }}
        theme={theme}
        insets={insets}
      />

      <CustomLanguageModal
        visible={showCustomLanguageInput}
        onClose={() => {
          setShowCustomLanguageInput(false);
          setCustomLanguageInput('');
        }}
        value={customLanguageInput}
        onChangeText={setCustomLanguageInput}
        onConfirm={(value: string) => {
          dispatch({ type: 'SET_FIELD', field: 'language', value });
          setShowCustomLanguageInput(false);
          setCustomLanguageInput('');
        }}
        theme={theme}
      />

      <LanguagePickerModal
        visible={showOriginalLanguagePicker}
        onClose={() => setShowOriginalLanguagePicker(false)}
        currentLanguage={formState.originalLanguage}
        onSelect={(language) => dispatch({ type: 'SET_FIELD', field: 'originalLanguage', value: language })}
        onSelectCustom={() => {
          setCustomOriginalLanguageInput('');
          setShowCustomOriginalLanguageInput(true);
        }}
        theme={theme}
        insets={insets}
        title="Select Original Language"
      />

      <CustomLanguageModal
        visible={showCustomOriginalLanguageInput}
        onClose={() => {
          setShowCustomOriginalLanguageInput(false);
          setCustomOriginalLanguageInput('');
        }}
        value={customOriginalLanguageInput}
        onChangeText={setCustomOriginalLanguageInput}
        onConfirm={(value: string) => {
          dispatch({ type: 'SET_FIELD', field: 'originalLanguage', value });
          setShowCustomOriginalLanguageInput(false);
          setCustomOriginalLanguageInput('');
        }}
        theme={theme}
        title="Custom Original Language"
      />

      <TrackingTypePickerModal
        visible={showTrackingPicker}
        onClose={() => setShowTrackingPicker(false)}
        currentType={formState.trackingType}
        onSelect={(type) => dispatch({ type: 'SET_FIELD', field: 'trackingType', value: type })}
        theme={theme}
        insets={insets}
      />
    </SafeAreaView>
  );
};

export default AddBookScreen;
