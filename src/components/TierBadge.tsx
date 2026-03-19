import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserTier } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface TierBadgeProps {
  tier: UserTier;
  onUpgrade?: () => void;
}

export function TierBadge({ tier, onUpgrade }: TierBadgeProps) {
  const isPro = tier === 'pro';

  return (
    <View style={styles.container}>
      <View style={[styles.badge, isPro ? styles.proBadge : styles.freeBadge]}>
        <Ionicons
          name={isPro ? 'diamond' : 'person'}
          size={14}
          color={isPro ? '#000' : Colors.text}
        />
        <Text style={[styles.badgeText, isPro && styles.proBadgeText]}>
          {isPro ? 'PRO' : 'FREE'}
        </Text>
      </View>
      {!isPro && onUpgrade && (
        <Pressable style={styles.upgradeBtn} onPress={onUpgrade}>
          <Text style={styles.upgradeText}>Upgrade</Text>
          <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  freeBadge: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proBadge: {
    backgroundColor: Colors.gold,
  },
  badgeText: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  proBadgeText: {
    color: '#000',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  upgradeText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
