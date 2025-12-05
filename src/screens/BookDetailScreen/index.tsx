import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, ScrollView, Animated, Text, Modal, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SessionConflictModal, ConfirmationModal } from '../../components/modals';
import { useAppContext } from '../../context/AppContext';
import SwipeableTabs from '../../components/common/SwipeableTabs';
import { 
  BookDetailHeader,
  BookDetailCover,
  BookDetailInfo,
  BookDetailTags,
  BookDetailActions,
  BookDetailSessions,
  BookDetailNotes,
  BookReadingSpeed
} from '../../components/book';
import { SessionTimer } from '../../components/session'; 
import { TagInput, RereadModal } from '../../components'; 
import { logger } from '../../../logger';

import { 
  useBookDetail, 
  useBookImage, 
  useBookActions, 
  useBookSessions 
} from './hooks';

import {
  EditBasicInfo,
  EditSeriesInfo,
  EditFormatLanguage,
  EditProgress,
  EditStatusRating
} from './components';

import {
  FormatPickerModal,
  LanguagePickerModal,
  CustomLanguageModal,
  TrackingTypePickerModal
} from '../AddBookScreen/components';

import { getBookSessionsCount, getBookNotesCount } from '../../../database';
import { Book, ActiveSession, RootStackParamList } from '../../types';

type BookDetailScreenRouteProp = RouteProp<RootStackParamList, 'BookDetail'>;
type BookDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookDetail'>;

interface BookDetailScreenProps {
  route: BookDetailScreenRouteProp;
  navigation: BookDetailScreenNavigationProp;
}

const CelebrationModal = ({ visible, onClose, theme }: { visible: boolean, onClose: () => void, theme: any }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '85%', backgroundColor: theme.cardBackground, borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 2, borderColor: '#FFD700' }}>
        <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
        <Text style={{ color: '#FFD700', fontSize: 24, fontWeight: 'bold', marginTop: 15, textAlign: 'center' }}>
          Congratulations!
        </Text>
        <Text style={{ color: theme.text, fontSize: 16, marginTop: 10, textAlign: 'center', lineHeight: 24 }}>
          You've completed this journey. Another book finished, another world explored!
        </Text>
        <TouchableOpacity 
          onPress={onClose}
          style={{ marginTop: 25, backgroundColor: '#FFD700', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 }}
        >
          <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>Awesome!</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const BookDetailScreen: React.FC<BookDetailScreenProps> = ({ route, navigation }) => {
  const { bookId } = route.params;
  const { theme, activeSession, setActiveSession, db, prepareUndo } = useAppContext();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const coverRef = useRef<{ triggerGlow: () => void }>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Modals State
  const [showSessionConflict, setShowSessionConflict] = useState(false);
  const [showFormatPicker, setShowFormatPicker] = useState<boolean>(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showOriginalLanguagePicker, setShowOriginalLanguagePicker] = useState<boolean>(false);
  const [showTrackingPicker, setShowTrackingPicker] = useState<boolean>(false);
  const [showCustomLanguageInput, setShowCustomLanguageInput] = useState<boolean>(false);
  const [showCustomOriginalLanguageInput, setShowCustomOriginalLanguageInput] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  
  // Inputs State
  const [customLanguageInput, setCustomLanguageInput] = useState<string>('');
  const [customOriginalLanguageInput, setCustomOriginalLanguageInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showRereadModal, setShowRereadModal] = useState(false);

  // SAFETY GUARD
  if (!bookId) {
    logger.error('BookDetailScreen received undefined bookId');
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.text, fontSize: 16 }}>Error: Book not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 10 }}>
            <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {
    book,
    bookState,
    dispatch,
    isEditing,
    setIsEditing, 
    setBookThemeColor,
    existingTags,
    fetchBookDetails,
    handleEdit,
    handleCancel
  } = useBookDetail(db!, bookId, navigation);

  const {
    isUploadingImage,
    isOptimizingImage,
    imagePreview,
    setImagePreview,
    handlePickImage,
    handleCoverUrlChange
  } = useBookImage(dispatch, isEditing, bookState, book);

  const { 
    handleSave, 
    handleDelete
  } = useBookActions(
    db!,
    book,
    bookState,
    setBookThemeColor,
    setIsEditing,
    setImagePreview,
    fetchBookDetails,
    activeSession,
    (session: ActiveSession | null) => setActiveSession(session),
    navigation,
    bookId,
    prepareUndo,
    () => setShowCelebration(true)
  );

  const { readingSpeed } = useBookSessions(db!, bookId, book, navigation);

  // --- INTERCEPT BACK ACTION ---
  const handleBackPress = useCallback(() => {
    if (isEditing) {
      // If editing, show our custom confirmation modal
      setShowDiscardModal(true);
      return true; // Stop default behavior
    }
    // If not editing, allow default behavior
    navigation.goBack();
    return true;
  }, [isEditing, navigation]);

  const handleDiscardChanges = useCallback(() => {
    setShowDiscardModal(false);
    handleCancel(); // This resets the form via the hook
  }, [handleCancel]);

  // Handle Android Hardware Back Button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => handleBackPress();
      // Store the subscription
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Use subscription.remove() to cleanup
      return () => subscription.remove();
    }, [handleBackPress])
  );

  const handleStartSession = async () => {
    if (!book || !db) return;
    
    const isChapters = book.trackingType === 'chapters';
    const total = isChapters ? (book.totalChapters || 0) : (book.totalPages || 0);
    const current = isChapters ? (book.currentChapter || 0) : (book.currentPage || 0);

    if (total > 0 && current >= total) {
      setShowRereadModal(true);
      return;
    }

    startTheSession(current);
  };

  const handleConfirmReread = async () => {
    if (!book || !db) return;
    const isChapters = book.trackingType === 'chapters';
    if (isChapters) {
      await db.runAsync('UPDATE books SET currentChapter = 0, status = "Reading", readCount = COALESCE(readCount, 0) + 1 WHERE id = ?', [book.id]);
      book.currentChapter = 0;
    } else {
      await db.runAsync('UPDATE books SET currentPage = 0, status = "Reading", readCount = COALESCE(readCount, 0) + 1 WHERE id = ?', [book.id]);
      book.currentPage = 0;
    }
    book.status = "Reading";
    // @ts-ignore
    book.readCount = (book.readCount || 0) + 1; 
    
    setShowRereadModal(false);
    fetchBookDetails(); 
    startTheSession(0); 
  };

  const startTheSession = async (startVal: number) => {
    if (!book) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const newSession: ActiveSession = {
      id: Date.now(), 
      bookId: book.id,
      bookTitle: book.title,
      startTime: new Date().toISOString(),
      startPage: book.trackingType === 'chapters' ? 0 : startVal,
      startChapter: book.trackingType === 'chapters' ? startVal : 0,
      isPaused: false,
      pausedTime: 0
    };

    setActiveSession(newSession);
    await AsyncStorage.setItem('activeSession', JSON.stringify(newSession));
    
    if (book.status !== 'Reading') {
       dispatch({ type: 'SET_FIELD', field: 'status', value: 'Reading' });
       if (db) {
         await db.runAsync('UPDATE books SET status = ? WHERE id = ?', ['Reading', book.id]);
       }
    }
  };

  const handleSaveWithGlow = useCallback(async () => {
    const success = await handleSave();
    if (success) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        if (coverRef.current && coverRef.current.triggerGlow) {
          coverRef.current.triggerGlow();
        }
      }, 300);
    }
  }, [handleSave]);

  const handleCelebrationClose = useCallback(() => {
    setShowCelebration(false);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!db || !bookId) return;
      try {
        const sCount = await getBookSessionsCount(db, bookId);
        const nCount = await getBookNotesCount(db, bookId);
        setSessionsCount(sCount);
        setNotesCount(nCount);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    fetchCounts();
  }, [db, bookId]);

  useEffect(() => {
    const animation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, []);

  const refreshCounts = useCallback(async () => {
    if (!db || !bookId) return;
    try {
      const sCount = await getBookSessionsCount(db, bookId);
      const nCount = await getBookNotesCount(db, bookId);
      setSessionsCount(sCount);
      setNotesCount(nCount);
    } catch (error) {
      console.error('Error refreshing counts:', error);
    }
  }, [db, bookId]);

  const handleAddTag = useCallback((tag: string) => {
    dispatch({ type: 'ADD_TAG', tag });
  }, []);

  const handleRemoveTag = useCallback((tag: string) => {
    dispatch({ type: 'REMOVE_TAG', tag });
  }, []);

  if (!db) return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  if (!book) return <View style={{ flex: 1, backgroundColor: theme.background }} />;

  // --- Dynamic Tabs: Only show Details when editing ---
  const tabs = isEditing 
    ? [{ label: 'Details' }]
    : [
        { label: 'Details' },
        { label: 'Sessions', count: sessionsCount },
        { label: 'Notes', count: notesCount }
      ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <BookDetailHeader
        isEditing={isEditing}
        onEdit={() => {
          // Force jump to tab 0 when editing starts
          setActiveTab(0);
          handleEdit();
        }}
        onSave={handleSaveWithGlow}
        onCancel={handleCancel}
        onDelete={handleDelete}
        // Use custom back handler
        onBack={handleBackPress} 
        theme={theme}
      />
      
      {activeSession && activeSession.bookId === book.id && (
         <SessionTimer 
            book={book}
            showFocusMode={showFocusMode}
            onCloseFocusMode={() => setShowFocusMode(false)}
            onSessionComplete={async () => {
               fetchBookDetails();
               refreshCounts();
               setShowFocusMode(false);
               
               if (db && bookId) {
                 const freshBook = await db.getFirstAsync<{
                   trackingType: string;
                   totalPages: number;
                   totalChapters: number;
                   currentPage: number;
                   currentChapter: number;
                   status: string;
                 }>('SELECT trackingType, totalPages, totalChapters, currentPage, currentChapter, status FROM books WHERE id = ?', [bookId]);
                 
                 if (freshBook) {
                   const isChapters = freshBook.trackingType === 'chapters';
                   const total = isChapters ? freshBook.totalChapters : freshBook.totalPages;
                   const current = isChapters ? freshBook.currentChapter : freshBook.currentPage;
                   
                   if (total > 0 && current >= total) {
                     logger.log('📚 Book is complete! Capturing state and showing celebration...');
                     setShowCelebration(true);
                     if (freshBook.status !== 'Finished') {
                        await db.runAsync('UPDATE books SET status = "Finished" WHERE id = ?', [bookId]);
                        fetchBookDetails();
                     }
                   }
                 }
               }
            }} 
         />
      )}

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <SwipeableTabs
          tabs={tabs}
          theme={theme}
          initialTab={0}
          onTabChange={setActiveTab}
          lazyLoad={true}
          // Force active tab to 0 if editing
          activeTab={isEditing ? 0 : activeTab}
        >
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <BookDetailCover 
              ref={coverRef}
              coverUrl={isEditing ? (imagePreview || bookState.coverUrl || null) : book?.coverUrl || null}
              isEditing={isEditing}
              onPickImage={handlePickImage}
              onUrlChange={handleCoverUrlChange}
              isUploadingImage={isUploadingImage}
              isOptimizingImage={isOptimizingImage}
              theme={theme}
              currentCoverUrl={bookState.coverUrl}
            />
            
            {isEditing ? (
              <View>
                <EditBasicInfo bookState={bookState} dispatch={dispatch} theme={theme} />
                <EditSeriesInfo bookState={bookState} dispatch={dispatch} theme={theme} />
                <EditFormatLanguage 
                  bookState={bookState}
                  theme={theme}
                  onShowFormatPicker={() => setShowFormatPicker(true)}
                  onShowLanguagePicker={() => setShowLanguagePicker(true)}
                  onShowOriginalLanguagePicker={() => setShowOriginalLanguagePicker(true)}
                  onShowTrackingPicker={() => setShowTrackingPicker(true)}
                />
                <EditProgress bookState={bookState} dispatch={dispatch} theme={theme} />
                <EditStatusRating bookState={bookState} dispatch={dispatch} theme={theme} />
                <View style={{ marginTop: 10 }}>
                  <TagInput
                    tags={bookState.tempTags || []}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    theme={theme}
                    existingTags={existingTags}
                  />
                </View>
              </View>
            ) : (
              <View>
                <BookDetailInfo book={book} theme={theme} bookState={bookState} dispatch={dispatch} isEditing={isEditing} currentReadPage={book.currentPage ?? 0} />
                <BookDetailTags book={book} theme={theme} navigation={navigation} />
                <BookDetailActions
                  book={book}
                  bookState={{ tempStatus: bookState.status, tempRating: bookState.rating ?? null }}
                  dispatch={dispatch}
                  isEditing={isEditing}
                  theme={theme}
                  activeSession={activeSession}
                  onStartSession={handleStartSession}
                  onOpenFocusMode={() => setShowFocusMode(true)}
                  onShowSessionConflict={() => setShowSessionConflict(true)}
                />
                {((book?.totalPages ?? 0) > 0 || (book?.totalChapters ?? 0) > 0) && (
                  <BookReadingSpeed readingSpeed={readingSpeed} theme={theme} />
                )}
              </View>
            )}
          </ScrollView>

          {/* TAB 2: SESSIONS (Hidden when editing) */}
          {!isEditing && (
            <View style={{ flex: 1, backgroundColor: theme.background }}>
              <BookDetailSessions
                book={book}
                onRefreshSessions={() => {
                  fetchBookDetails();
                  refreshCounts();
                }}
                fullHeight={true}
              />
            </View>
          )}

          {/* TAB 3: NOTES (Hidden when editing) */}
          {!isEditing && (
            <View style={{ flex: 1, backgroundColor: theme.background }}>
              <BookDetailNotes
                bookId={bookId}
                bookTitle={book?.title}
                theme={theme}
                db={db}
                fullHeight={true}
                prepareUndo={prepareUndo}
                onRefreshNotes={refreshCounts}
                book={book}
              />
            </View>
          )}
        </SwipeableTabs>
      </Animated.View>

      {/* MODALS */}
      <CelebrationModal visible={showCelebration} onClose={handleCelebrationClose} theme={theme} />

      {/* Discard Changes Modal */}
      <ConfirmationModal
        visible={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={handleDiscardChanges}
        title="Discard Changes?"
        message="You have unsaved edits. If you leave now, your changes will be lost."
        confirmText="Discard"
        cancelText="Keep Editing"
        theme={theme}
        icon="alert-octagon-outline"
        isDanger={true}
      />

      <RereadModal 
        visible={showRereadModal} 
        onClose={() => setShowRereadModal(false)} 
        onConfirm={handleConfirmReread} 
        theme={theme}
        bookTitle={book.title}
      />

      <FormatPickerModal visible={showFormatPicker} onClose={() => setShowFormatPicker(false)} currentFormat={bookState.format} onSelect={(format) => dispatch({ type: 'SET_FIELD', field: 'format', value: format })} theme={theme} insets={insets} />
      <LanguagePickerModal visible={showLanguagePicker} onClose={() => setShowLanguagePicker(false)} currentLanguage={bookState.language} onSelect={(language) => dispatch({ type: 'SET_FIELD', field: 'language', value: language })} onSelectCustom={() => { setCustomLanguageInput(''); setShowCustomLanguageInput(true); }} theme={theme} insets={insets} />
      <CustomLanguageModal visible={showCustomLanguageInput} onClose={() => { setShowCustomLanguageInput(false); setCustomLanguageInput(''); }} value={customLanguageInput} onChangeText={setCustomLanguageInput} onConfirm={(value: string) => { dispatch({ type: 'SET_FIELD', field: 'language', value }); setShowCustomLanguageInput(false); setCustomLanguageInput(''); }} theme={theme} />
      <LanguagePickerModal visible={showOriginalLanguagePicker} onClose={() => setShowOriginalLanguagePicker(false)} currentLanguage={bookState.originalLanguage} onSelect={(language) => dispatch({ type: 'SET_FIELD', field: 'originalLanguage', value: language })} onSelectCustom={() => { setCustomOriginalLanguageInput(''); setShowCustomOriginalLanguageInput(true); }} theme={theme} insets={insets} title="Select Original Language" />
      <CustomLanguageModal visible={showCustomOriginalLanguageInput} onClose={() => { setShowCustomOriginalLanguageInput(false); setCustomOriginalLanguageInput(''); }} value={customOriginalLanguageInput} onChangeText={setCustomOriginalLanguageInput} onConfirm={(value: string) => { dispatch({ type: 'SET_FIELD', field: 'originalLanguage', value }); setShowCustomOriginalLanguageInput(false); setCustomOriginalLanguageInput(''); }} theme={theme} title="Custom Original Language" />
      <TrackingTypePickerModal visible={showTrackingPicker} onClose={() => setShowTrackingPicker(false)} currentType={bookState.trackingType} onSelect={(type) => dispatch({ type: 'SET_FIELD', field: 'trackingType', value: type })} theme={theme} insets={insets} />
      <SessionConflictModal
        visible={showSessionConflict}
        onClose={() => setShowSessionConflict(false)}
        currentBookTitle={activeSession?.bookTitle || ''}
        onViewCurrent={() => {
          setShowSessionConflict(false);
          if (activeSession) {
            navigation.push('BookDetail', { bookId: activeSession.bookId });
          }
        }}
        onEndAndStart={async () => {
          if (activeSession) {
            setActiveSession(null);
            await AsyncStorage.removeItem('activeSession');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            
            setTimeout(() => {
              handleStartSession();
              setShowFocusMode(true);
            }, 300);
          }
        }}
        theme={theme}
      />
    </SafeAreaView>
  );
};

export default BookDetailScreen;
