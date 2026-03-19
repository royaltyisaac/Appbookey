import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProvider, useNavigation } from './src/navigation/NavigationContext';
import { useAuthStore } from './src/stores/authStore';
import { useUserStore } from './src/stores/userStore';
import { useBookStore } from './src/stores/bookStore';
import HomeScreen from './src/screens/HomeScreen';
import CreateScreen from './src/screens/CreateScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';
import UpgradeScreen from './src/screens/UpgradeScreen';
import BookReaderScreen from './src/screens/BookReaderScreen';
import { Colors, Spacing, FontSizes } from './src/constants/theme';

const TABS = [
  { label: 'Home', icon: 'home' as const },
  { label: 'Create', icon: 'add-circle' as const },
  { label: 'Library', icon: 'library' as const },
  { label: 'Settings', icon: 'settings' as const },
];

function AppContent() {
  const { currentTab, setTab, stack, goBack } = useNavigation();
  const loadAuth = useAuthStore((s) => s.loadUser);
  const loadTier = useUserStore((s) => s.loadTier);
  const loadBooks = useBookStore((s) => s.loadBooks);

  useEffect(() => {
    loadAuth();
    loadTier();
    loadBooks();
  }, []);

  const topRoute = stack[stack.length - 1];

  // Render stack screens (overlay on top of tabs)
  if (topRoute) {
    let screenContent: React.ReactNode = null;
    const screenTitle =
      topRoute.screen === 'auth'
        ? 'Sign In'
        : topRoute.screen === 'upgrade'
          ? 'Upgrade'
          : topRoute.screen === 'book'
            ? 'Reader'
            : '';

    switch (topRoute.screen) {
      case 'auth':
        screenContent = <AuthScreen />;
        break;
      case 'upgrade':
        screenContent = <UpgradeScreen />;
        break;
      case 'book':
        screenContent = <BookReaderScreen />;
        break;
    }

    return (
      <View style={styles.container}>
        <View style={styles.stackHeader}>
          <Pressable style={styles.backButton} onPress={goBack}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.stackTitle}>{screenTitle}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.screenContent}>{screenContent}</View>
      </View>
    );
  }

  // Render tab screens
  let tabContent: React.ReactNode = null;
  switch (currentTab) {
    case 0:
      tabContent = <HomeScreen />;
      break;
    case 1:
      tabContent = <CreateScreen />;
      break;
    case 2:
      tabContent = <LibraryScreen />;
      break;
    case 3:
      tabContent = <SettingsScreen />;
      break;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EbookMagic</Text>
      </View>
      <View style={styles.screenContent}>{tabContent}</View>
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => (
          <Pressable
            key={tab.label}
            style={styles.tabItem}
            onPress={() => setTab(index)}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={currentTab === index ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                currentTab === index && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  stackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    color: Colors.text,
    fontSize: FontSizes.md,
  },
  stackTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  screenContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
