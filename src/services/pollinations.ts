import { getPollinationsApiKey } from '../config/api';

const BASE_URL = 'https://gen.pollinations.ai';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function generateText(
  messages: ChatMessage[],
): Promise<string> {
  const apiKey = getPollinationsApiKey();
  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nova',
      messages,
      max_tokens: 4096,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { error?: { message?: string } }).error?.message ||
        `Text generation failed: ${response.status}`,
    );
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function generateTextStreaming(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
): Promise<string> {
  const apiKey = getPollinationsApiKey();
  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nova',
      messages,
      max_tokens: 4096,
      temperature: 0.8,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Text generation failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          onChunk(content);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return fullText;
}

export function getImageUrl(
  prompt: string,
  model: 'flux' | 'gptimage' = 'flux',
  width: number = 800,
  height: number = 1200,
): string {
  const apiKey = getPollinationsApiKey();
  const encodedPrompt = encodeURIComponent(prompt);
  let url = `${BASE_URL}/image/${encodedPrompt}?model=${model}&width=${width}&height=${height}&quality=hd`;
  if (apiKey) {
    url += `&key=${apiKey}`;
  }
  return url;
}

export async function generateCoverImage(
  prompt: string,
  model: 'flux' | 'gptimage',
): Promise<string> {
  return getImageUrl(prompt, model, 800, 1200);
}
