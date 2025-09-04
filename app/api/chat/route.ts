export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToProvider, parseStreamChunk } from '@/lib/openrouter';
import { sendMessageToGigaChat, parseGigaChatStreamChunk } from '@/lib/gigachat';
import { AIProvider } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { messages, provider = 'google-gemma' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: { message: 'Messages array is required' } },
        { status: 400 }
      );
    }

    const validProviders: AIProvider[] = ['google-gemma', 'mistral-medium', 'gigachat'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: { message: 'Invalid provider specified' } },
        { status: 400 }
      );
    }

    let stream: ReadableStream<Uint8Array>;
    let parseFn: (chunk: string) => string | null;

    if (provider === 'mistral-medium') {
      stream = await sendMessageToMistral(messages, provider);
      parseFn = parseMistralStreamChunk;
    } else if (provider === 'gigachat') {
      stream = await sendMessageToGigaChat(messages, provider);
      parseFn = parseGigaChatStreamChunk;
    } else {
      stream = await sendMessageToProvider(messages, provider);
      parseFn = parseStreamChunk;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    const customReadable = new ReadableStream({
      start(controller) {
        async function pump() {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                break;
              }
              const chunk = decoder.decode(value, { stream: true });
              const content = parseFn(chunk);
              if (content) {
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            }
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          }
        }
        pump();
      },
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error' 
        } 
      },
      { status: 500 }
    );
  }
}