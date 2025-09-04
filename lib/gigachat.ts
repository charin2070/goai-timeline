import { randomUUID } from 'crypto';

const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
const AUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';

const CLIENT_ID = process.env.GIGACHAT_CLIENT_ID;
const API_KEY = process.env.GIGACHAT_API_KEY;
const SCOPE = process.env.GIGACHAT_SCOPE;

let accessToken = '';
let tokenExpiry = 0;

async function getAccessToken() {
  if (Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${API_KEY}`,
      'RqUID': randomUUID(),
    },
    body: `scope=${SCOPE}`,
  });

  if (!response.ok) {
    throw new Error('Failed to get GigaChat access token');
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_at - 60) * 1000; // Refresh 60 seconds before expiry

  return accessToken;
}

export async function sendMessageToGigaChat(
  messages: { role: string; content: string }[],
  provider: AIProvider
): Promise<ReadableStream<Uint8Array>> {
  const token = await getAccessToken();

  const response = await fetch(GIGACHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: provider,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to send message to GigaChat');
  }

  if (!response.body) {
    throw new Error('No response body received');
  }

  return response.body;
}

export function parseGigaChatStreamChunk(chunk: string): string | null {
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);

      if (data === '[DONE]') {
        return null;
      }

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          return content;
        }
      } catch (e) {
        continue;
      }
    }
  }

  return null;
}
