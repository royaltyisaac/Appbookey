import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  onDelete?: () => void;
}

export function BookCard({ book, onPress, onDelete }: BookCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.coverContainer}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholderCover]}>
            <Ionicons name="book" size={40} color={Colors.textMuted} />
          </View>
        )}
        {book.isWatermarked && (
          <View style={styles.watermarkBadge}>
            <Text style={styles.watermarkText}>FREE</Text>
          </View>
        )}
        {book.coverModel === 'gptimage' && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{book.totalPages} pages</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="folder-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{book.genre}</Text>
          </View>
        </View>
      </View>
      {onDelete && (
        <Pressable style={styles.deleteBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  coverContainer: {
    position: 'relative',
    width: 100,
    height: 150,
  },
  cover: {
    width: 100,
    height: 150,
    backgroundColor: Colors.surfaceLight,
  },
  placeholderCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  watermarkText: {
    color: '#000',
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  proBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  proBadgeText: {
    color: '#000',
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginBottom: Spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  deleteBtn: {
    padding: Spacing.md,
    justifyContent: 'center',
  },
});
