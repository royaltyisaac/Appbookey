import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useUserStore } from '../../src/stores/userStore';
import { useBookStore } from '../../src/stores/bookStore';
import { TierBadge } from '../../src/components/TierBadge';
import { BookCard } from '../../src/components/BookCard';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tier = useUserStore((s) => s.tier);
  const booksGenerated = useUserStore((s) => s.booksGenerated);
  const books = useBookStore((s) => s.books);

  const recentBooks = books.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroTitle}>EbookMagic</Text>
            <Text style={styles.heroSubtitle}>AI Ebook Generator</Text>
          </View>
          <TierBadge tier={tier} onUpgrade={() => router.push('/upgrade')} />
        </View>
        <Text style={styles.heroDescription}>
          Create professional ebooks with AI-powered content and stunning covers.
          From idea to published book in minutes.
        </Text>

        {!isAuthenticated ? (
          <Pressable
            style={styles.connectBtn}
            onPress={() => router.push('/auth')}
          >
            <Ionicons name="person-add" size={20} color="#FFF" />
            <Text style={styles.connectBtnText}>Sign Up Free</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.createBtn}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="sparkles" size={20} color="#FFF" />
            <Text style={styles.createBtnText}>Create New Ebook</Text>
          </Pressable>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="book" size={24} color={Colors.primary} />
          <Text style={styles.statNumber}>{booksGenerated}</Text>
          <Text style={styles.statLabel}>Books Created</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document-text" size={24} color={Colors.accent} />
          <Text style={styles.statNumber}>
            {books.reduce((sum, b) => sum + b.totalPages, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Pages</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons
            name={tier === 'pro' ? 'diamond' : 'person'}
            size={24}
            color={Colors.gold}
          />
          <Text style={styles.statNumber}>{tier === 'pro' ? 'PRO' : 'FREE'}</Text>
          <Text style={styles.statLabel}>Current Tier</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresGrid}>
          {[
            { icon: 'create-outline' as const, title: 'AI Writing', desc: 'Nova LLM generates professional content' },
            { icon: 'image-outline' as const, title: 'Cover Art', desc: 'AI-generated book covers' },
            { icon: 'document-text-outline' as const, title: 'Up to 200 Pages', desc: 'Pro users get full-length books' },
            { icon: 'download-outline' as const, title: 'Export PDF', desc: 'Print-ready PDF export' },
          ].map((feature) => (
            <View key={feature.title} style={styles.featureCard}>
              <Ionicons name={feature.icon} size={28} color={Colors.primary} />
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Books */}
      {recentBooks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Books</Text>
            <Pressable onPress={() => router.push('/(tabs)/library')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {recentBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onPress={() => router.push(`/book/${book.id}`)}
            />
          ))}
        </View>
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
    paddingBottom: Spacing.xxl,
  },
  hero: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  heroDescription: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  connectBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    color: Colors.text,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureTitle: {
    color: Colors.text,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  featureDesc: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    marginTop: 4,
  },
});
