import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenerationProgress } from '../types';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

interface GenerationProgressViewProps {
  progress: GenerationProgress;
}

const STAGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  outline: 'list-outline',
  chapters: 'create-outline',
  cover: 'image-outline',
  finalizing: 'checkmark-circle-outline',
  complete: 'checkmark-done-outline',
  error: 'alert-circle-outline',
};

export function GenerationProgressView({ progress }: GenerationProgressViewProps) {
  const iconName = STAGE_ICONS[progress.stage] || 'hourglass-outline';
  const isComplete = progress.stage === 'complete';
  const isError = progress.stage === 'error';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {isComplete || isError ? (
          <Ionicons
            name={iconName}
            size={48}
            color={isError ? Colors.error : Colors.success}
          />
        ) : (
          <ActivityIndicator size="large" color={Colors.primary} />
        )}
      </View>

      <Text style={styles.message}>{progress.message}</Text>

      {progress.stage === 'chapters' && (
        <Text style={styles.chapterInfo}>
          Chapter {progress.currentChapter} of {progress.totalChapters}
        </Text>
      )}

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress.progress}%` },
              isError && styles.progressBarError,
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progress.progress)}%</Text>
      </View>

      <View style={styles.stagesContainer}>
        {(['outline', 'chapters', 'cover', 'finalizing'] as const).map((stage) => {
          const stageIndex = ['outline', 'chapters', 'cover', 'finalizing'].indexOf(stage);
          const currentIndex = ['outline', 'chapters', 'cover', 'finalizing', 'complete'].indexOf(progress.stage);
          const isDone = currentIndex > stageIndex;
          const isCurrent = progress.stage === stage;

          return (
            <View key={stage} style={styles.stageItem}>
              <Ionicons
                name={isDone ? 'checkmark-circle' : isCurrent ? 'radio-button-on' : 'radio-button-off'}
                size={16}
                color={isDone ? Colors.success : isCurrent ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.stageText,
                  isDone && styles.stageTextDone,
                  isCurrent && styles.stageTextCurrent,
                ]}
              >
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  message: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  chapterInfo: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    marginBottom: Spacing.lg,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  progressBarError: {
    backgroundColor: Colors.error,
  },
  progressText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    width: 40,
    textAlign: 'right',
  },
  stagesContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stageText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  stageTextDone: {
    color: Colors.success,
  },
  stageTextCurrent: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
