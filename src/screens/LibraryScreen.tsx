import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '../navigation/NavigationContext';
import { useBookStore } from '../stores/bookStore';
import { BookCard } from '../components/BookCard';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function LibraryScreen() {
  const { navigate } = useNavigation();
  const books = useBookStore((s) => s.books);
  const removeBook = useBookStore((s) => s.removeBook);
  const [filterGenre, setFilterGenre] = useState<string | null>(null);

  const genres = [...new Set(books.map((b) => b.genre))];
  const filteredBooks = filterGenre
    ? books.filter((b) => b.genre === filterGenre)
    : books;

  const handleDelete = (id: string, title: string) => {
    const doDelete = () => removeBook(id);

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
        doDelete();
      }
    } else {
      Alert.alert('Delete Book', `Delete "${title}"? This cannot be undone.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>My Library</Text>
      <Text style={styles.pageSubtitle}>
        {books.length} {books.length === 1 ? 'book' : 'books'} in your collection
      </Text>

      {/* Genre Filter */}
      {genres.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <View style={styles.filterRow}>
            <Pressable
              style={[styles.filterChip, !filterGenre && styles.filterChipActive]}
              onPress={() => setFilterGenre(null)}
            >
              <Text
                style={[
                  styles.filterText,
                  !filterGenre && styles.filterTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>
            {genres.map((genre) => (
              <Pressable
                key={genre}
                style={[
                  styles.filterChip,
                  filterGenre === genre && styles.filterChipActive,
                ]}
                onPress={() => setFilterGenre(genre)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filterGenre === genre && styles.filterTextActive,
                  ]}
                >
                  {genre}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Books List */}
      {filteredBooks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No books yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first AI-generated ebook
          </Text>
          <Pressable
            style={styles.createBtn}
            onPress={() => navigate('create')}
          >
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={styles.createBtnText}>Create Ebook</Text>
          </Pressable>
        </View>
      ) : (
        filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onPress={() => navigate('book', { id: book.id })}
            onDelete={() => handleDelete(book.id, book.title)}
          />
        ))
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
  pageTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  filterScroll: {
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
});
