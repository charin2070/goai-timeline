import { randomUUID } from 'crypto';
import { AIProvider } from './types';

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

  try {
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
      const errorText = await response.text();
      throw new Error(`Failed to get GigaChat access token: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_at - 60) * 1000; // Refresh 60 seconds before expiry

    return accessToken;
  } catch (error) {
    console.error('Error in getAccessToken:', error);
    throw error;
  }
}

export async function sendMessageToGigaChat(
  messages: { role: string; content: string }[],
  provider: AIProvider
): Promise<ReadableStream<Uint8Array>> {
  try {
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
      const errorText = await response.text();
      throw new Error(`Failed to send message to GigaChat: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    return response.body;
  } catch (error) {
    console.error('Error in sendMessageToGigaChat:', error);
    throw error;
  }
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
