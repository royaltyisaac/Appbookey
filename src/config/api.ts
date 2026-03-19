import Constants from 'expo-constants';

// API key is injected at build time via EAS Secrets
// Set it in EAS dashboard: Project → Secrets → POLLINATIONS_API_KEY
// For local development, create a .env file with POLLINATIONS_API_KEY=sk_your_key
const API_KEY =
  Constants.expoConfig?.extra?.pollinationsApiKey ||
  process.env.EXPO_PUBLIC_POLLINATIONS_API_KEY ||
  '';

export function getPollinationsApiKey(): string {
  if (!API_KEY) {
    console.warn(
      'POLLINATIONS_API_KEY not configured. Set it in EAS Secrets or .env',
    );
  }
  return API_KEY;
}
