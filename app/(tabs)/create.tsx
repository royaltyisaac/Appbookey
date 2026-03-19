import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useUserStore } from '../../src/stores/userStore';
import { useBookStore } from '../../src/stores/bookStore';
import { GenerationProgressView } from '../../src/components/GenerationProgressView';
import { generateEbook } from '../../src/services/ebookGenerator';
import { getImageUrl } from '../../src/services/pollinations';
import { GenerationConfig, GenerationProgress } from '../../src/types';
import { GENRES, COVER_STYLES, TIER_CONFIG } from '../../src/constants/tiers';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';

export default function CreateScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tier = useUserStore((s) => s.tier);
  const canGenerate = useUserStore((s) => s.canGenerateBook);
  const hasWatermark = useUserStore((s) => s.hasWatermark);
  const getMaxPages = useUserStore((s) => s.getMaxPages);
  const getAvailableCoverModels = useUserStore((s) => s.getAvailableCoverModels);
  const incrementBooksGenerated = useUserStore((s) => s.incrementBooksGenerated);
  const addBook = useBookStore((s) => s.addBook);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Fantasy');
  const [selectedCoverStyle, setSelectedCoverStyle] = useState('Minimalist Modern');
  const [coverModel, setCoverModel] = useState<'flux' | 'gptimage'>('flux');
  const [targetPages, setTargetPages] = useState('20');
  const [chapterCount, setChapterCount] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const maxPages = getMaxPages();
  const availableModels = getAvailableCoverModels();

  const previewCover = useCallback(() => {
    if (!title) return;
    const prompt = `Professional book cover, ${selectedCoverStyle} style, ${selectedGenre} genre, titled "${title}"`;
    const url = getImageUrl(prompt, coverModel, 400, 600);
    setCoverPreviewUrl(url);
  }, [title, selectedCoverStyle, selectedGenre, coverModel]);

  const showAlert = (alertTitle: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${alertTitle}: ${message}`);
    } else {
      Alert.alert(alertTitle, message);
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      showAlert('Sign In Required', 'Please sign in to start generating ebooks.');
      router.push('/auth');
      return;
    }

    if (!canGenerate()) {
      showAlert(
        'Limit Reached',
        'You have reached your book generation limit. Upgrade to Pro for unlimited books.',
      );
      router.push('/upgrade');
      return;
    }

    if (!title.trim() || !author.trim() || !description.trim()) {
      showAlert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const pages = parseInt(targetPages, 10);
    if (isNaN(pages) || pages < 5 || pages > maxPages) {
      showAlert('Invalid Pages', `Page count must be between 5 and ${maxPages}.`);
      return;
    }

    const chapters = parseInt(chapterCount, 10);
    if (isNaN(chapters) || chapters < 1 || chapters > 30) {
      showAlert('Invalid Chapters', 'Chapter count must be between 1 and 30.');
      return;
    }

    const config: GenerationConfig = {
      title: title.trim(),
      genre: selectedGenre,
      description: description.trim(),
      targetPages: pages,
      chapterCount: chapters,
      coverStyle: selectedCoverStyle,
      coverModel,
      author: author.trim(),
    };

    setIsGenerating(true);
    try {
      const book = await generateEbook(
        config,
        hasWatermark(),
        (p) => setProgress(p),
      );

      await addBook(book);
      await incrementBooksGenerated();

      setIsGenerating(false);
      setProgress(null);

      // Reset form
      setTitle('');
      setAuthor('');
      setDescription('');
      setCoverPreviewUrl(null);

      router.push(`/book/${book.id}`);
    } catch (error) {
      setProgress({
        stage: 'error',
        currentChapter: 0,
        totalChapters: 0,
        message: error instanceof Error ? error.message : 'Generation failed',
        progress: 0,
      });
      setIsGenerating(false);
    }
  };

  if (isGenerating && progress) {
    return (
      <View style={styles.container}>
        <View style={styles.generatingContainer}>
          <Text style={styles.generatingTitle}>Generating Your Ebook</Text>
          <Text style={styles.generatingSubtitle}>
            This may take a few minutes. Please don't close the app.
          </Text>
          <GenerationProgressView progress={progress} />
          {progress.stage === 'error' && (
            <Pressable
              style={styles.retryBtn}
              onPress={() => {
                setProgress(null);
                setIsGenerating(false);
              }}
            >
              <Text style={styles.retryBtnText}>Try Again</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Create New Ebook</Text>
      <Text style={styles.pageSubtitle}>
        Fill in the details below and let AI write your book
      </Text>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Book Details</Text>

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter book title"
          placeholderTextColor={Colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Author Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter author name"
          placeholderTextColor={Colors.textMuted}
          value={author}
          onChangeText={setAuthor}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your book's concept, themes, and storyline..."
          placeholderTextColor={Colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Genre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genre</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {GENRES.map((genre) => (
              <Pressable
                key={genre}
                style={[
                  styles.chip,
                  selectedGenre === genre && styles.chipSelected,
                ]}
                onPress={() => setSelectedGenre(genre)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedGenre === genre && styles.chipTextSelected,
                  ]}
                >
                  {genre}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Pages & Chapters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Structure</Text>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Target Pages (max {maxPages})</Text>
            <TextInput
              style={styles.input}
              placeholder={`5 - ${maxPages}`}
              placeholderTextColor={Colors.textMuted}
              value={targetPages}
              onChangeText={setTargetPages}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Chapters</Text>
            <TextInput
              style={styles.input}
              placeholder="1 - 30"
              placeholderTextColor={Colors.textMuted}
              value={chapterCount}
              onChangeText={setChapterCount}
              keyboardType="numeric"
            />
          </View>
        </View>
        {tier === 'free' && (
          <View style={styles.tierNotice}>
            <Ionicons name="information-circle" size={16} color={Colors.warning} />
            <Text style={styles.tierNoticeText}>
              Free tier: max {TIER_CONFIG.free.maxPagesPerBook} pages with watermark.{' '}
              <Text
                style={styles.upgradeLink}
                onPress={() => router.push('/upgrade')}
              >
                Upgrade to Pro
              </Text>{' '}
              for up to 200 pages.
            </Text>
          </View>
        )}
      </View>

      {/* Cover */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cover Design</Text>

        <Text style={styles.label}>Cover Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {COVER_STYLES.map((style) => (
              <Pressable
                key={style}
                style={[
                  styles.chip,
                  selectedCoverStyle === style && styles.chipSelected,
                ]}
                onPress={() => setSelectedCoverStyle(style)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCoverStyle === style && styles.chipTextSelected,
                  ]}
                >
                  {style}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.label, { marginTop: Spacing.md }]}>Cover Model</Text>
        <View style={styles.modelRow}>
          {availableModels.map((model) => (
            <Pressable
              key={model}
              style={[
                styles.modelCard,
                coverModel === model && styles.modelCardSelected,
              ]}
              onPress={() => setCoverModel(model)}
            >
              <Ionicons
                name={model === 'gptimage' ? 'diamond' : 'image'}
                size={24}
                color={
                  coverModel === model ? Colors.primary : Colors.textMuted
                }
              />
              <Text
                style={[
                  styles.modelName,
                  coverModel === model && styles.modelNameSelected,
                ]}
              >
                {model === 'flux' ? 'Flux' : 'GPT Image'}
              </Text>
              <Text style={styles.modelDesc}>
                {model === 'flux' ? 'Free tier' : 'Premium quality'}
              </Text>
              {model === 'gptimage' && (
                <View style={styles.proTag}>
                  <Text style={styles.proTagText}>PRO</Text>
                </View>
              )}
            </Pressable>
          ))}
          {tier === 'free' && (
            <Pressable
              style={[styles.modelCard, styles.modelCardLocked]}
              onPress={() => router.push('/upgrade')}
            >
              <Ionicons name="lock-closed" size={24} color={Colors.textMuted} />
              <Text style={styles.modelName}>GPT Image</Text>
              <Text style={styles.modelDesc}>Upgrade to unlock</Text>
            </Pressable>
          )}
        </View>

        {/* Cover Preview */}
        {title.length > 0 && (
          <Pressable style={styles.previewBtn} onPress={previewCover}>
            <Ionicons name="eye-outline" size={18} color={Colors.primary} />
            <Text style={styles.previewBtnText}>Preview Cover</Text>
          </Pressable>
        )}

        {coverPreviewUrl && (
          <View style={styles.coverPreview}>
            <Image
              source={{ uri: coverPreviewUrl }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Generate Button */}
      <Pressable
        style={[
          styles.generateBtn,
          (!isAuthenticated || !title || !author || !description) &&
            styles.generateBtnDisabled,
        ]}
        onPress={handleGenerate}
        disabled={!isAuthenticated || !title || !author || !description}
      >
        <Ionicons name="sparkles" size={22} color="#FFF" />
        <Text style={styles.generateBtnText}>Generate Ebook</Text>
      </Pressable>

      {!isAuthenticated && (
        <Pressable
          style={styles.authNotice}
          onPress={() => router.push('/auth')}
        >
          <Ionicons name="person" size={16} color={Colors.warning} />
          <Text style={styles.authNoticeText}>
            Sign in to start generating ebooks
          </Text>
        </Pressable>
      )}
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
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  generatingTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  generatingSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryBtn: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
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
  label: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  modelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modelCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  modelCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  modelCardLocked: {
    opacity: 0.5,
  },
  modelName: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  modelNameSelected: {
    color: Colors.primary,
  },
  modelDesc: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  proTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  proTagText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '700',
  },
  tierNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  tierNoticeText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  upgradeLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  previewBtnText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  coverPreview: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: '#FFF',
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  authNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  authNoticeText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
});
