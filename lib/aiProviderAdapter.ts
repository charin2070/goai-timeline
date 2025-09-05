import { sendMessageToProvider } from './openrouter';
import { sendMessageToMistral, getModels as getMistralModels, MistralProvider } from './mistral';
import { AIProvider } from './types';

export interface AiProvider {
  name: string;
  models: string[];

  getModels(): Promise<string[]>;
  sendMessage(messages: { role: string; content: string }[]): Promise<ReadableStream<Uint8Array>>;
  setTemperature(value: number): void;
  setMaxTokens(value: number): void;
}

export class AiProviderAdapter {
  static async sendMessage(
    provider: AIProvider,
    messages: { role: string; content: string }[]
  ): Promise<ReadableStream<Uint8Array>> {
    switch (provider) {
      case 'google-gemma':
        return sendMessageToProvider(messages, provider);
      case 'mistral-medium':
        const mistralProviderInstance = new MistralProvider();
        return sendMessageToMistral(messages, mistralProviderInstance);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  static async getAvailableModels(provider: AIProvider): Promise<string[]> {
    switch (provider) {
      case 'google-gemma':
        // OpenRouter does not expose a model listing API, so we return a static list
        return ['google/gemma-2-9b-it:free'];
      case 'mistral-medium':
        const mistralModels = await getMistralModels();
        return mistralModels.data.map(model => model.id);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
