import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/constants/theme';

const POLLINATIONS_AUTH_URL = 'https://enter.pollinations.ai';

export default function AuthScreen() {
  const router = useRouter();
  const { setApiKey, isAuthenticated } = useAuthStore();
  const [manualKey, setManualKey] = useState('');
  const [error, setError] = useState('');

  // Check for API key in URL hash (BYOP redirect)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.slice(1));
        const key = params.get('api_key');
        if (key) {
          handleSetKey(key);
          // Clean URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    }
  }, []);

  const handleSetKey = async (key: string) => {
    if (!key.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    try {
      await setApiKey(key.trim());
      router.back();
    } catch {
      setError('Failed to save API key');
    }
  };

  const handleBYOP = () => {
    const redirectUrl = Platform.OS === 'web'
      ? window.location.origin + window.location.pathname
      : 'appbookey://auth';

    const authUrl = `${POLLINATIONS_AUTH_URL}/authorize?redirect_url=${encodeURIComponent(redirectUrl)}`;
    Linking.openURL(authUrl);
  };

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          <Text style={styles.successTitle}>Connected!</Text>
          <Text style={styles.successSubtitle}>
            Your Pollinations API key is active
          </Text>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="key" size={48} color={Colors.primary} />
        <Text style={styles.title}>Connect API</Text>
        <Text style={styles.subtitle}>
          Connect your Pollinations API key to start generating ebooks
        </Text>
      </View>

      {/* BYOP Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Connect (Recommended)</Text>
        <Text style={styles.sectionDesc}>
          Sign in with Pollinations and automatically get an API key. Uses the
          Bring Your Own Pollen model — you pay for your own usage.
        </Text>
        <Pressable style={styles.byopBtn} onPress={handleBYOP}>
          <Ionicons name="flash" size={20} color="#FFF" />
          <Text style={styles.byopBtnText}>Connect with Pollinations</Text>
        </Pressable>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Manual Key Entry */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Entry</Text>
        <Text style={styles.sectionDesc}>
          Enter your API key from{' '}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(POLLINATIONS_AUTH_URL)}
          >
            enter.pollinations.ai
          </Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="sk_... or pk_..."
          placeholderTextColor={Colors.textMuted}
          value={manualKey}
          onChangeText={(text) => {
            setManualKey(text);
            setError('');
          }}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.submitBtn, !manualKey && styles.submitBtnDisabled]}
          onPress={() => handleSetKey(manualKey)}
          disabled={!manualKey}
        >
          <Text style={styles.submitBtnText}>Connect</Text>
        </Pressable>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
        <Text style={styles.infoText}>
          Your API key is stored locally on your device and never sent to our
          servers. It's only used to communicate directly with the Pollinations API.
        </Text>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  successTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  successSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  doneBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
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
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionDesc: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  link: {
    color: Colors.primary,
    fontWeight: '600',
  },
  byopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  byopBtnText: {
    color: '#FFF',
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
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
  errorText: {
    color: Colors.error,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.md,
  },
  submitBtn: {
    backgroundColor: Colors.surfaceHighlight,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: Colors.text,
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
