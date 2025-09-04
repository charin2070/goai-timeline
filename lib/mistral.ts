import { OpenRouterResponse, ApiError, MistralModelsResponse } from './types';
import { AiProvider } from './aiProviderAdapter';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const API_KEY= process.env.MISTRAL_API_KEY;
const MODEL = process.env.AI_MISTRAL_MODEL;
const TEMPERATURE = process.env.AI_TEMPERATURE;
const MAX_TOKENS = process.env.AI_MAX_TOKENS;

export async function sendMessageToMistral(
  messages: { role: string; content: string }[],
  provider: AIProvider
): Promise<ReadableStream<Uint8Array>> {


  if (!API_KEY) {
    throw new Error('Mistral API key is not configured');
  }

  const availableModels = await getModels();
  console.log('Available models:', availableModels);
  const isModelAvailable = availableModels.data.some(model => model.id === MODEL);

  if (!isModelAvailable) {
    const modelList = availableModels.data.map(model => model.id).join(', ');
    throw new Error(`Модель ${MODEL} провайдера Mistral не доступна. Сейчас у него такие модели: ${modelList}`);
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
      stream: true,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error?.message || 'Failed to send message to Mistral');
    }

    if (!response.body) {
        throw new Error('No response body received');
    }

    return response.body;
    }

    export async function getModels(): Promise<MistralModelsResponse> {
  if (!API_KEY) {
    throw new Error('Mistral API key is not configured');
  }

  const response = await fetch('https://api.mistral.ai/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch models from Mistral');
  }

  const data: MistralModelsResponse = await response.json();
  return data;
}

    export function parseMistralStreamChunk(chunk: string): string | null {
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

export class MistralProvider implements AiProvider {
  name = 'Mistral';
  models: string[] = [];
  private temperature: number = parseFloat(process.env.AI_TEMPERATURE || '0.7');
  private maxTokens: number = parseInt(process.env.AI_MAX_TOKENS || '1000', 10);

  async getModels(): Promise<string[]> {
    const response = await getModels();
    this.models = response.data.map(model => model.id);
    return this.models;
  }

  async sendMessage(messages: { role: string; content: string }[]): Promise<ReadableStream<Uint8Array>> {
    return sendMessageToMistral(messages);
  }

  setTemperature(value: number): void {
    this.temperature = value;
  }

  setMaxTokens(value: number): void {
    this.maxTokens = value;
  }
}
