import { NextResponse } from 'next/server';
import { AIProvider } from '@/lib/types';
import { sendMessageToGigaChat } from '@/lib/gigachat';
import { sendMessageToMistral } from '@/lib/mistral';
import { sendMessageToProvider } from '@/lib/openrouter';
import crypto from "crypto";
import { promises as fs } from 'fs';
import path from 'path';

// Helper to parse CSV and find the prompt
function parseCsvForPrompt(csvContent: string, promptName: string): string | null {
  const lines = csvContent.split(/\r?\n/);
  const header = lines[0].split(','); // Assuming simple comma split for header

  const nameIndex = header.indexOf('name');
  const contentIndex = header.indexOf('content');

  if (nameIndex === -1 || contentIndex === -1) {
    console.error('CSV header missing "name" or "content" column.');
    return null;
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;

    // A simple regex to split CSV by commas, respecting quoted fields
    // This is a simplified approach and might not handle all edge cases of CSV
    const values = line.match(/(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g);

    if (!values || values.length <= Math.max(nameIndex, contentIndex)) {
        continue; // Malformed line or not enough columns
    }

    // Clean up values: remove trailing comma, quotes
    const cleanedValues = values.map(val => {
        let cleaned = val.endsWith(',') ? val.slice(0, -1) : val;
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1).replace(/""/g, '"'); // Handle escaped quotes
        }
        return cleaned;
    });

    const currentName = cleanedValues[nameIndex];
    if (currentName === promptName) {
      return cleanedValues[contentIndex];
    }
  }
  return null;
}

// Helper function to send a non-streaming message to GigaChat for testing
async function testGigaChat(messages: { role: string; content: string }[], provider: AIProvider): Promise<any> {
  // Temporarily modify sendMessageToGigaChat behavior or create a new function
  // For simplicity, we'll directly make the fetch request here with stream: false
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
          'RqUID': crypto.randomUUID(),
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
      console.error('Error in getAccessToken for test:', error);
      throw error;
    }
  }

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
      stream: false, // Set stream to false for testing
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send test message to GigaChat: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Helper function to send a non-streaming message to Mistral for testing
async function testMistral(messages: { role: string; content: string }[], provider: AIProvider): Promise<any> {
  const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
  const API_KEY= process.env.MISTRAL_API_KEY;
  const MODEL = process.env.AI_MISTRAL_MODEL;
  const TEMPERATURE = process.env.AI_TEMPERATURE;
  const MAX_TOKENS = process.env.AI_MAX_TOKENS;

  if (!API_KEY) {
    throw new Error('Mistral API key is not configured');
  }

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false, // Set stream to false for testing
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(error.error?.message || 'Failed to send test message to Mistral');
  }

  return response.json();
}

// Helper function to send a non-streaming message to OpenRouter for testing
async function testOpenRouter(messages: { role: string; content: string }[], provider: AIProvider): Promise<any> {
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  let model: string;
  switch (provider) {
    case 'google-gemma':
      model = process.env.AI_OPENROUTER_MODEL || 'google/gemma-2-9b-it:free';
      break;
    case 'mistral-medium': // Although mistral has its own API, it can also be accessed via OpenRouter
      model = process.env.AI_MISTRAL_MODEL || 'mistralai/mistral-medium';
      break;
    default:
      throw new Error(`Unsupported provider for OpenRouter test: ${provider}`);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'Gemma Chat',
    },
    body: JSON.stringify({
      model: model,
      messages,
      stream: false, // Set stream to false for testing
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error: any = await response.json();
    throw new Error(error.error?.message || `Failed to send test message to ${provider}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const { provider, temperature, maxTokens } = await request.json();

    // Read CSV file
    const csvFilePath = path.join(process.cwd(), 'prompts', 'prompts.csv');
    const csvContent = await fs.readFile(csvFilePath, 'utf-8');
    const testPromptContent = parseCsvForPrompt(csvContent, 'ai_connection_test') || 'Hello, AI! Test connection.';

    const testMessage = [{ role: 'user', content: testPromptContent }];
    let responseData: any;
    let modelUsed: string = '';

    switch (provider) {
      case 'gigachat':
        responseData = await testGigaChat(testMessage, provider);
        modelUsed = provider; // GigaChat uses provider as model name
        break;
      case 'mistral-medium':
        responseData = await testMistral(testMessage, provider);
        modelUsed = process.env.AI_MISTRAL_MODEL || 'mistralai/mistral-medium'; // Get model from env
        break;
      case 'google-gemma':
        responseData = await testOpenRouter(testMessage, provider);
        modelUsed = process.env.AI_OPENROUTER_MODEL || 'google/gemma-2-9b-it:free'; // Get model from env
        break;
      default:
        return NextResponse.json({ success: false, message: `Unsupported AI provider: ${provider}` }, { status: 400 });
    }

    // Extract content from the response
    let content = 'No content received.';
    if (responseData.choices && responseData.choices.length > 0) {
      content = responseData.choices[0].message?.content || responseData.choices[0].text || 'No content in choices.';
    }

    return NextResponse.json({
      success: true,
      message: `Test successful! Response: ${content.substring(0, 100)}...`,
      testPrompt: testPromptContent,
      modelUsed: modelUsed
    });
  } catch (error: any) {
    console.error('AI test API error:', error);
    return NextResponse.json({ success: false, message: error.message || 'An unknown error occurred during AI test.', fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)) }, { status: 500 });
  }
}