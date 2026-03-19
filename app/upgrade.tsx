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
import { useUserStore } from '../src/stores/userStore';
import { TIER_CONFIG } from '../src/constants/tiers';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/constants/theme';

export default function UpgradeScreen() {
  const router = useRouter();
  const { tier, setTier } = useUserStore();

  const handleUpgrade = async () => {
    // In production, this would handle payment via IAP
    // For now, we toggle the tier for demonstration
    await setTier('pro');
    if (Platform.OS === 'web') {
      window.alert('Upgraded to Pro! Enjoy premium features.');
    } else {
      Alert.alert('Upgraded!', 'You now have access to all Pro features.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleDowngrade = async () => {
    await setTier('free');
    if (Platform.OS === 'web') {
      window.alert('Downgraded to Free tier.');
    } else {
      Alert.alert('Downgraded', 'You are now on the Free tier.');
    }
  };

  const isPro = tier === 'pro';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="diamond" size={48} color={Colors.gold} />
        <Text style={styles.title}>
          {isPro ? 'You\'re a Pro!' : 'Upgrade to Pro'}
        </Text>
        <Text style={styles.subtitle}>
          {isPro
            ? 'Enjoy all premium features'
            : 'Unlock unlimited books, premium covers, and more'}
        </Text>
      </View>

      {/* Plan Comparison */}
      <View style={styles.plansRow}>
        {/* Free Plan */}
        <View style={[styles.planCard, !isPro && styles.planCardCurrent]}>
          <Text style={styles.planName}>Free</Text>
          <Text style={styles.planPrice}>$0</Text>
          <Text style={styles.planPeriod}>forever</Text>
          <View style={styles.planFeatures}>
            {TIER_CONFIG.free.features.map((f) => (
              <View key={f} style={styles.planFeatureRow}>
                <Ionicons name="checkmark" size={14} color={Colors.textMuted} />
                <Text style={styles.planFeatureText}>{f}</Text>
              </View>
            ))}
          </View>
          {!isPro && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current Plan</Text>
            </View>
          )}
        </View>

        {/* Pro Plan */}
        <View style={[styles.planCard, styles.planCardPro, isPro && styles.planCardCurrent]}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>POPULAR</Text>
          </View>
          <Text style={[styles.planName, styles.planNamePro]}>Pro</Text>
          <Text style={[styles.planPrice, styles.planPricePro]}>$9.99</Text>
          <Text style={styles.planPeriod}>/ month</Text>
          <View style={styles.planFeatures}>
            {TIER_CONFIG.pro.features.map((f) => (
              <View key={f} style={styles.planFeatureRow}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.gold} />
                <Text style={[styles.planFeatureText, styles.planFeatureTextPro]}>{f}</Text>
              </View>
            ))}
          </View>
          {isPro && (
            <View style={[styles.currentBadge, styles.currentBadgePro]}>
              <Text style={styles.currentBadgeText}>Current Plan</Text>
            </View>
          )}
        </View>
      </View>

      {/* Comparison Table */}
      <View style={styles.comparisonCard}>
        <Text style={styles.comparisonTitle}>Feature Comparison</Text>
        {[
          { feature: 'Book Generation', free: '1 book', pro: 'Unlimited' },
          { feature: 'Max Pages', free: '20 pages', pro: '200 pages' },
          { feature: 'Cover Art', free: 'Flux (Standard)', pro: 'GPT Image (Premium)' },
          { feature: 'Watermark', free: 'Yes', pro: 'No' },
          { feature: 'Text Model', free: 'Nova', pro: 'Nova' },
          { feature: 'PDF Export', free: 'Yes', pro: 'Yes' },
        ].map((row, i) => (
          <View key={row.feature}>
            {i > 0 && <View style={styles.compDivider} />}
            <View style={styles.compRow}>
              <Text style={styles.compFeature}>{row.feature}</Text>
              <Text style={styles.compFree}>{row.free}</Text>
              <Text style={styles.compPro}>{row.pro}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action */}
      {!isPro ? (
        <Pressable style={styles.upgradeBtn} onPress={handleUpgrade}>
          <Ionicons name="diamond" size={20} color="#000" />
          <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.downgradeBtn} onPress={handleDowngrade}>
          <Text style={styles.downgradeBtnText}>Switch to Free Plan</Text>
        </Pressable>
      )}

      <Text style={styles.disclaimer}>
        In-app purchases will be available soon. Currently, tier switching is for
        preview purposes.
      </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  plansRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  planCardPro: {
    borderColor: Colors.gold,
    backgroundColor: Colors.surfaceLight,
  },
  planCardCurrent: {
    borderColor: Colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    left: '25%',
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  popularBadgeText: {
    color: '#000',
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  planName: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  planNamePro: {
    color: Colors.gold,
  },
  planPrice: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.text,
  },
  planPricePro: {
    color: Colors.gold,
  },
  planPeriod: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  planFeatures: {
    gap: Spacing.sm,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  planFeatureText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    lineHeight: 18,
  },
  planFeatureTextPro: {
    color: Colors.textSecondary,
  },
  currentBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  currentBadgePro: {
    backgroundColor: Colors.gold,
  },
  currentBadgeText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  comparisonCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  comparisonTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  compDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  compRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  compFeature: {
    flex: 2,
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  compFree: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  compPro: {
    flex: 1,
    color: Colors.gold,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  upgradeBtnText: {
    color: '#000',
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  downgradeBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  downgradeBtnText: {
    color: Colors.textMuted,
    fontSize: FontSizes.md,
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
