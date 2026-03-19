import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Share,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useBookStore } from '../../src/stores/bookStore';
import { generateBookHtml } from '../../src/services/ebookGenerator';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';

export default function BookReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const book = useBookStore((s) => s.getBook(id || ''));
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Book not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const chapter = book.chapters[currentChapter];

  const handleExportPdf = async () => {
    try {
      const html = generateBookHtml(book);
      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === 'web') {
        // On web, trigger print dialog
        await Print.printAsync({ html });
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Export ${book.title}`,
            UTI: 'com.adobe.pdf',
          });
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to export PDF. Please try again.');
      } else {
        Alert.alert('Export Failed', 'Could not export PDF. Please try again.');
      }
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: book.title,
        message: `Check out "${book.title}" by ${book.author} - Generated with Appbookey!`,
      });
    } catch {
      // User cancelled
    }
  };

  const goToChapter = (index: number) => {
    setCurrentChapter(index);
    setShowToc(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.actionBar}>
        <Pressable style={styles.actionBtn} onPress={() => setShowToc(!showToc)}>
          <Ionicons name="list" size={20} color={Colors.text} />
          <Text style={styles.actionBtnText}>TOC</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={handleExportPdf}>
          <Ionicons name="download-outline" size={20} color={Colors.text} />
          <Text style={styles.actionBtnText}>PDF</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={Colors.text} />
          <Text style={styles.actionBtnText}>Share</Text>
        </Pressable>
      </View>

      {/* TOC Overlay */}
      {showToc && (
        <View style={styles.tocOverlay}>
          <View style={styles.tocCard}>
            <Text style={styles.tocTitle}>Table of Contents</Text>
            <ScrollView>
              {book.chapters.map((ch, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.tocItem,
                    currentChapter === i && styles.tocItemActive,
                  ]}
                  onPress={() => goToChapter(i)}
                >
                  <Text
                    style={[
                      styles.tocItemText,
                      currentChapter === i && styles.tocItemTextActive,
                    ]}
                  >
                    {i + 1}. {ch.title}
                  </Text>
                  <Text style={styles.tocItemPages}>{ch.pageCount}p</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <Pressable style={styles.tocBackdrop} onPress={() => setShowToc(false)} />
        </View>
      )}

      <ScrollView ref={scrollRef} style={styles.reader} contentContainerStyle={styles.readerContent}>
        {/* Cover Section (first view) */}
        {currentChapter === 0 && (
          <View style={styles.coverSection}>
            {book.coverUrl && (
              <Image
                source={{ uri: book.coverUrl }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>by {book.author}</Text>
            <View style={styles.bookMeta}>
              <View style={styles.metaPill}>
                <Ionicons name="folder" size={12} color={Colors.primary} />
                <Text style={styles.metaPillText}>{book.genre}</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="document-text" size={12} color={Colors.primary} />
                <Text style={styles.metaPillText}>{book.totalPages} pages</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="layers" size={12} color={Colors.primary} />
                <Text style={styles.metaPillText}>{book.chapters.length} chapters</Text>
              </View>
            </View>
            {book.isWatermarked && (
              <View style={styles.watermarkNotice}>
                <Ionicons name="information-circle" size={16} color={Colors.warning} />
                <Text style={styles.watermarkNoticeText}>
                  This book contains a watermark. Upgrade to Pro to remove it.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Chapter Content */}
        <View style={styles.chapterContainer}>
          <Text style={styles.chapterLabel}>
            Chapter {currentChapter + 1} of {book.chapters.length}
          </Text>
          <Text style={styles.chapterTitle}>{chapter.title}</Text>
          <View style={styles.chapterDivider} />

          {/* Watermark overlay */}
          {book.isWatermarked && (
            <Text style={styles.watermarkText}>APPBOOKEY FREE</Text>
          )}

          <Text style={styles.chapterContent}>{chapter.content}</Text>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navBar}>
        <Pressable
          style={[styles.navBtn, currentChapter === 0 && styles.navBtnDisabled]}
          onPress={() => goToChapter(currentChapter - 1)}
          disabled={currentChapter === 0}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={currentChapter === 0 ? Colors.textMuted : Colors.text}
          />
          <Text
            style={[
              styles.navBtnText,
              currentChapter === 0 && styles.navBtnTextDisabled,
            ]}
          >
            Previous
          </Text>
        </Pressable>

        <Text style={styles.navInfo}>
          {currentChapter + 1} / {book.chapters.length}
        </Text>

        <Pressable
          style={[
            styles.navBtn,
            currentChapter === book.chapters.length - 1 && styles.navBtnDisabled,
          ]}
          onPress={() => goToChapter(currentChapter + 1)}
          disabled={currentChapter === book.chapters.length - 1}
        >
          <Text
            style={[
              styles.navBtnText,
              currentChapter === book.chapters.length - 1 &&
                styles.navBtnTextDisabled,
            ]}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={
              currentChapter === book.chapters.length - 1
                ? Colors.textMuted
                : Colors.text
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  errorText: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  actionBtnText: {
    color: Colors.text,
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  tocOverlay: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  tocBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  tocCard: {
    backgroundColor: Colors.surface,
    maxHeight: '60%',
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  tocTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tocItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: 2,
  },
  tocItemActive: {
    backgroundColor: Colors.surfaceHighlight,
  },
  tocItemText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.md,
    flex: 1,
  },
  tocItemTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tocItemPages: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  reader: {
    flex: 1,
  },
  readerContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  coverSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
  },
  bookTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  bookAuthor: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  bookMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
  },
  metaPillText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  watermarkNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  watermarkNoticeText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  chapterContainer: {
    position: 'relative',
  },
  chapterLabel: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  chapterTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  chapterDivider: {
    height: 3,
    width: 60,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginBottom: Spacing.lg,
  },
  watermarkText: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    fontSize: 48,
    color: Colors.watermark,
    fontWeight: '800',
    transform: [{ rotate: '-35deg' }],
    zIndex: 1,
    pointerEvents: 'none',
  },
  chapterContent: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'justify',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  navBtnTextDisabled: {
    color: Colors.textMuted,
  },
  navInfo: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
});
