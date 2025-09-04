'use client';

import { useChat } from '@/hooks/use-chat';
import { SignIn } from '@/components/auth/sign-in';
import { useAuth } from '@/lib/auth-context';
import { Loading } from '@/components/ui/loading';
import { AIProviderWrapper } from '@/lib/ai-provider-context';
import { FileWrapper } from '@/lib/file-context';
import { ChatFunctionsProvider } from '@/lib/chat-functions-context';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { LeftPanel } from '@/components/chat/left-panel';
import { CenterPanel } from '@/components/chat/center-panel';
import { RightPanel } from '@/components/chat/right-panel';
import { useState } from 'react';

function ChatContent() {
  const { session, status, isLoading } = useAuth();
  const [pamlPrompt, setPamlPrompt] = useState('');
  
  const {
    messages,
    isLoading: chatLoading,
    sendMessage,
    clearChat,
    retryLastMessage,
    repeatMessage,
    editMessage,
  } = useChat();

  // Show loading state while checking authentication
  if (isLoading || status === 'loading') {
    return <Loading />;
  }

  // Show sign-in page if not authenticated
  if (status === 'unauthenticated' || !session) {
    return <SignIn />;
  }

  // Show chat interface if authenticated
  return (
    <ChatFunctionsProvider sendMessage={sendMessage} clearChat={clearChat}>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20}>
            <LeftPanel />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40}>
            <CenterPanel setPamlPrompt={setPamlPrompt} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={40}>
            <RightPanel 
              messages={messages}
              isTyping={chatLoading}
              onRepeatMessage={repeatMessage}
              editMessage={editMessage}
              onSendMessage={sendMessage}
              onClearChat={clearChat}
              initialPrompt={pamlPrompt}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ChatFunctionsProvider>
  );
}

function Chat() {
  return <ChatContent />;
}

export default function ChatPage() {
  return (
    <AIProviderWrapper>
      <FileWrapper>
        <Chat />
      </FileWrapper>
    </AIProviderWrapper>
  );
}
