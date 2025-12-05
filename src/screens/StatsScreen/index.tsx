import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAppContext } from '../../context/AppContext';
import { SwipeableTabs } from '../../components';
// CLEANED: Removed RewardsTrack
import { StatsCards, BookStatusChart } from '../../components/stats';
// CLEANED: Removed LevelProgress, MilestoneCarousel, AchievementShowcase
import { 
  HallOfFame, FormatChart, WeeklyRhythm, DailyPulse, SessionTimeline,
  YearlyChallenge, EditGoalModal
} from './components';
import { globalStyles } from '../../styles/globalStyles';
import { formatTotalTime } from '../../utils/helpers';

import { useStatsData, useStatsCalculations } from './hooks';
// CLEANED: Commented out Gamification Hooks
// import { useAutoAchievements } from '../../hooks/useAutoAchievements';
// import { useMilestones } from '../../hooks/useMilestones';
// import { MilestoneUnlockedModal } from '../../components/modals/MilestoneUnlockedModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getTierPriority = (tier?: string): number => {
  switch (tier) {
    case 'diamond': return 5;
    case 'platinum': return 4;
    case 'gold': return 3;
    case 'silver': return 2;
    case 'bronze': return 1;
    default: return 0;
  }
};

const StatsScreen = () => {
  const { theme, db, yearlyGoal, setYearlyGoal } = useAppContext();
  const insets = useSafeAreaInsets();
  const [showGoalModal, setShowGoalModal] = useState(false);

  const { allBooks, allSessions, isLoading, isRefreshing, fetchStats } = useStatsData(db);
  
  // CLEANED: Removed useMilestones logic
  /*
  const tempStats = useStatsCalculations(allBooks, allSessions, 0);
  const {
    newMilestones,
    unlockedMilestones,
    checkForNewMilestones,
    getMilestones,
    dismissNewMilestones
  } = useMilestones(db, tempStats.stats, allBooks, allSessions);

  const milestoneXP = unlockedMilestones.reduce((sum, m) => sum + (m.xp_awarded || 0), 0);
  const totalBonusXP = milestoneXP + bonusXP;
  */
  const totalBonusXP = 0; // Forced to 0 to disable leveling logic

  const {
    stats,
    statusCounts,
    readingHeatmap,
    recentSessions,
    ratingDistribution,
    formatStats,
    last7Days,
    dailyPulse,
    levelData
  } = useStatsCalculations(allBooks, allSessions, totalBonusXP);

  // CLEANED: Removed AutoAchievements
  /*
  useAutoAchievements(db, stats, allBooks, allSessions, (count, xp) => {
    fetchStats(true);
  });
  */

  // CLEANED: Removed Milestone Modal state
  // const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  // const [currentMilestone, setCurrentMilestone] = useState<any>(null);

  /*
  useEffect(() => {
    if (!isLoading && db) {
      checkForNewMilestones().then(newlyUnlocked => {
        if (newlyUnlocked && newlyUnlocked.length > 0) {
          setCurrentMilestone(newlyUnlocked[0]);
          setShowMilestoneModal(true);
        }
      });
    }
  }, [stats.booksFinished, stats.totalSessions, stats.longestStreak]);
  */

  /*
  const handleCloseMilestoneModal = () => {
    setShowMilestoneModal(false);
    dismissNewMilestones();
    
    if (newMilestones.length > 1) {
      setTimeout(() => {
        setCurrentMilestone(newMilestones[1]);
        setShowMilestoneModal(true);
      }, 300);
    }
  };
  */

  const handleRefresh = useCallback(() => {
    fetchStats(true);
  }, [fetchStats]);

  const handleTabChange = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.textSecondary, fontSize: 16 }}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderStatWidget = (label: string, value: string | number | React.ReactNode, icon: any, iconSet: any = 'Material', subLabel?: string) => (
    <View style={{ width: '48%', marginBottom: 12, backgroundColor: theme.background, borderRadius: 12, padding: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border }}>
      <View style={{ marginBottom: 8, backgroundColor: `${theme.primary}15`, padding: 8, borderRadius: 20 }}>
        {iconSet === 'Feather' ? <Feather name={icon || 'help-circle'} size={20} color={theme.primary} /> : 
         iconSet === 'Community' ? <MaterialCommunityIcons name={icon || 'help-circle'} size={20} color={theme.primary} /> :
         <MaterialIcons name={icon || 'help'} size={20} color={theme.primary} />}
      </View>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>{value}</Text>
      ) : value}
      <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2, textAlign: 'center' }}>
        {label} {subLabel ? `(${subLabel})` : ''}
      </Text>
    </View>
  );

  const hallOfFameRecords = [];
  if (stats.fastestRead) hallOfFameRecords.push({ title: stats.fastestRead.title, value: `${stats.fastestRead.speed} ${stats.fastestRead.unit}`, subtitle: 'Fastest Read', icon: 'speedometer' });
  if (stats.longestBook) hallOfFameRecords.push({ title: stats.longestBook.title, value: `${stats.longestBook.value} ${stats.primaryUnit}`, subtitle: 'Longest Book', icon: 'book-open-variant' });
  if (stats.topAuthor) hallOfFameRecords.push({ title: stats.topAuthor.name, value: `${stats.topAuthor.count} books`, subtitle: 'Top Author', icon: 'account-star' });
  if (stats.topGenre) hallOfFameRecords.push({ title: stats.topGenre.name, value: `${stats.topGenre.count} books`, subtitle: 'Top Genre', icon: 'tag-heart' });

  const isChapters = stats.primaryUnit === 'chapters';
  
  // CLEANED: Mocking empty milestones
  // const { unlocked } = getMilestones();
  const unlocked: any[] = [];
  
  /*
  const achievementData = unlocked
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      icon: m.icon,
      category: m.category,
      tier: m.tier,
      unlockedAt: m.unlockedAt
    }));

  const carouselData = unlocked
    .sort((a, b) => getTierPriority(b.tier) - getTierPriority(a.tier))
    .map(m => ({
      id: m.id,
      label: m.name,
      icon: m.icon,
      achieved: true,
      category: m.category,
      tier: m.tier
    }));
  */

  const refreshControl = (
    <RefreshControl 
      refreshing={isRefreshing} 
      onRefresh={handleRefresh} 
      tintColor={theme.primary} 
      colors={[theme.primary]} 
    />
  );

  const tabs = [
    { label: 'Overview', icon: 'dashboard', iconSet: 'Material' },
    { label: 'Insights', icon: 'insights', iconSet: 'Material' },
    { label: 'Activity', icon: 'timeline', iconSet: 'Material' },
    { label: 'Goals', icon: 'emoji-events', iconSet: 'Material' },
  ];

  const cleanDailyPulse = dailyPulse ? dailyPulse.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim() : '';

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: theme.background }]}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, textAlign: 'center' }}>
          Reading Analytics
        </Text>
      </View>

      {/* @ts-ignore */}
      <SwipeableTabs tabs={tabs} theme={theme} onTabChange={handleTabChange}>
        
        {/* 1. OVERVIEW */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }} refreshControl={refreshControl}>
          <StatsCards stats={stats} theme={theme} />
          <BookStatusChart statusCounts={statusCounts} theme={theme} />
        </ScrollView>

        {/* 2. INSIGHTS */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }} refreshControl={refreshControl}>
          <View style={{ backgroundColor: theme.cardBackground, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16, textAlign: 'center' }}>Reading Habits</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {renderStatWidget('Reading Speed', stats.readingSpeed.isMixed ? (<View style={{ alignItems: 'center' }}><Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold' }}>{stats.readingSpeed.pagesPerHour} pg/hr</Text><Text style={{ color: theme.text, fontSize: 14, fontWeight: 'bold' }}>{stats.readingSpeed.chaptersPerHour} ch/hr</Text></View>) : stats.readingSpeed.value, 'speedometer', 'Community', stats.readingSpeed.isMixed ? undefined : stats.readingSpeed.unit)}
              {renderStatWidget('Avg Session', `${stats.averageSessionTime}m`, 'timer-outline', 'Community')}
              {renderStatWidget('Longest Session', `${stats.longestSessionDuration}m`, 'timer-sand-full', 'Community')}
              {renderStatWidget('Most Active', stats.mostActiveTimeOfDay || 'N/A', 'weather-sunset', 'Community')}
            </View>
          </View>
          <FormatChart data={formatStats} theme={theme} />
          <View style={{ backgroundColor: theme.cardBackground, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16, textAlign: 'center' }}>Performance Profile</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {renderStatWidget('Completion', `${stats.completionRate}%`, 'check-circle', 'Feather')}
              {renderStatWidget('Avg Rating', stats.averageRating, 'star', 'Feather')}
              {renderStatWidget('Best Day', stats.bestReadingDay ? stats.bestReadingDay.split(',')[0] : 'N/A', 'calendar', 'Feather')}
              {renderStatWidget('Abandoned', stats.abandonedBooks, 'book-off-outline', 'Community', 'books')}
            </View>
          </View>
          <View style={{ backgroundColor: theme.cardBackground, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 12, textAlign: 'center' }}>Ratings Distribution</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 }}>
              {Object.entries(ratingDistribution).map(([rating, count]) => (
                <View key={rating} style={{ alignItems: 'center', width: '15%' }}>
                  <View style={{ width: '100%', height: `${stats.totalBooks > 0 ? (count / stats.totalBooks) * 100 : 0}%`, backgroundColor: theme.primary, borderRadius: 4, minHeight: 4 }} />
                  <Text style={{ marginTop: 4, fontSize: 12, color: theme.text }}>{rating}*</Text>
                </View>
              ))}
            </View>
          </View>
          {hallOfFameRecords.length > 0 && <HallOfFame records={hallOfFameRecords} theme={theme} />}
        </ScrollView>

        {/* 3. ACTIVITY */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }} refreshControl={refreshControl}>
          <DailyPulse todayValue={isChapters ? stats.todayChapters : stats.todayPages} todayUnit={isChapters ? 'chapters' : 'pages'} todayMinutes={stats.todayMinutes} message={cleanDailyPulse} theme={theme} />
          <WeeklyRhythm data={last7Days} theme={theme} />
          <SessionTimeline sessions={recentSessions} books={allBooks} theme={theme} />
          <View style={{ backgroundColor: theme.cardBackground, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16, textAlign: 'center' }}>Time Read</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <View style={{ alignItems: 'center', flex: 1 }}><Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>This Week</Text><Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{formatTotalTime(stats.weeklyMinutes)}</Text></View>
              <View style={{ alignItems: 'center', flex: 1 }}><Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>This Month</Text><Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{formatTotalTime(stats.monthlyMinutes)}</Text></View>
              <View style={{ alignItems: 'center', flex: 1 }}><Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>All Time</Text><Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{formatTotalTime(stats.totalReadingTime)}</Text></View>
            </View>
          </View>
          <View style={{ backgroundColor: theme.cardBackground, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16, textAlign: 'center' }}>30-Day Activity</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {readingHeatmap.map((day, index) => (
                <View key={index} style={{ width: (SCREEN_WIDTH - 32 - 40 - 24) / 7, height: (SCREEN_WIDTH - 32 - 40 - 24) / 7, borderRadius: 4, backgroundColor: day.intensity === 3 ? theme.primary : day.intensity === 2 ? `${theme.primary}80` : day.intensity === 1 ? `${theme.primary}40` : theme.border }} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* 4. GOALS */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }} refreshControl={refreshControl}>
          
          {/* 1. Yearly Challenge (Top) */}
          <YearlyChallenge booksRead={stats.booksFinished} target={yearlyGoal} theme={theme} onEdit={() => setShowGoalModal(true)} />

          {/* CLEANED: Commented out Gamification UI */}
          {/* <LevelProgress levelData={levelData} theme={theme} />
          
          <View style={{ backgroundColor: theme.cardBackground, borderRadius: 16, paddingVertical: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, paddingHorizontal: 16, marginBottom: 10 }}>Level Rewards</Text>
              <RewardsTrack currentLevel={levelData.currentLevel} theme={theme} />
          </View>
          
          {achievementData.length > 0 && (
            <AchievementShowcase achievements={achievementData} theme={theme} />
          )}
          
          {carouselData.length > 0 ? (
            <MilestoneCarousel milestones={carouselData} theme={theme} />
          ) : (
            <View style={{ padding: 20, alignItems: 'center', opacity: 0.6 }}>
              <Text style={{ color: theme.textSecondary }}>Keep reading to unlock achievements!</Text>
            </View>
          )}
          */}
          <View style={{ padding: 20, alignItems: 'center', opacity: 0.6 }}>
          </View>
        </ScrollView>

      </SwipeableTabs>

      <EditGoalModal visible={showGoalModal} currentGoal={yearlyGoal} onSave={setYearlyGoal} onClose={() => setShowGoalModal(false)} theme={theme} />
      {/* <MilestoneUnlockedModal visible={showMilestoneModal} milestone={currentMilestone} theme={theme} onClose={handleCloseMilestoneModal} /> */}
    </SafeAreaView>
  );
};

export default StatsScreen;
