import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useUserStore } from '../../src/stores/userStore';
import { useBookStore } from '../../src/stores/bookStore';
import { TierBadge } from '../../src/components/TierBadge';
import { TIER_CONFIG } from '../../src/constants/tiers';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, user, signOut } = useAuthStore();
  const { tier, booksGenerated } = useUserStore();
  const books = useBookStore((s) => s.books);

  const tierConfig = TIER_CONFIG[tier];

  const handleSignOut = () => {
    const doSignOut = () => signOut();
    if (Platform.OS === 'web') {
      if (window.confirm('Sign out of your account?')) {
        doSignOut();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Sign out of your account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: doSignOut },
        ],
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Tier</Text>
            <TierBadge tier={tier} onUpgrade={() => router.push('/upgrade')} />
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Books Generated</Text>
            <Text style={styles.cardValue}>
              {booksGenerated} / {tierConfig.maxBooks === 999 ? '∞' : tierConfig.maxBooks}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Max Pages/Book</Text>
            <Text style={styles.cardValue}>{tierConfig.maxPagesPerBook}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Watermark</Text>
            <Text style={[styles.cardValue, tierConfig.watermark && styles.cardValueWarning]}>
              {tierConfig.watermark ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Account</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  isAuthenticated ? styles.statusDotConnected : styles.statusDotDisconnected,
                ]}
              />
              <Text style={styles.cardValue}>
                {isAuthenticated ? 'Signed In' : 'Not Signed In'}
              </Text>
            </View>
          </View>
          {isAuthenticated && user && (
            <>
              <View style={styles.divider} />
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Name</Text>
                <Text style={styles.cardValue}>{user.displayName}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardValue}>{user.email}</Text>
              </View>
            </>
          )}
        </View>

        {isAuthenticated ? (
          <Pressable style={styles.disconnectBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.disconnectBtnText}>Sign Out</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.connectBtn}
            onPress={() => router.push('/auth')}
          >
            <Ionicons name="person" size={18} color="#FFF" />
            <Text style={styles.connectBtnText}>Sign In / Sign Up</Text>
          </Pressable>
        )}
      </View>

      {/* Plan Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Plan Features</Text>
        <View style={styles.card}>
          {tierConfig.features.map((feature, i) => (
            <View key={feature}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.success}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            </View>
          ))}
        </View>

        {tier === 'free' && (
          <Pressable
            style={styles.upgradeBtn}
            onPress={() => router.push('/upgrade')}
          >
            <Ionicons name="diamond" size={18} color="#000" />
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
          </Pressable>
        )}
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>App</Text>
            <Text style={styles.cardValue}>EbookMagic</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Version</Text>
            <Text style={styles.cardValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>AI Engine</Text>
            <Text style={styles.cardValue}>Pollinations Nova</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Total Books</Text>
            <Text style={styles.cardValue}>{books.length}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  pageTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cardLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
  },
  cardValue: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  cardValueWarning: {
    color: Colors.warning,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotConnected: {
    backgroundColor: Colors.success,
  },
  statusDotDisconnected: {
    backgroundColor: Colors.error,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  featureText: {
    color: Colors.text,
    fontSize: FontSizes.md,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  connectBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  disconnectBtnText: {
    color: Colors.error,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  upgradeBtnText: {
    color: '#000',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
});
