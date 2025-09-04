'use client';

import { useChat } from '@/hooks/use-chat';
import { ChatHeader } from '@/components/chat/chat-header';
import { MessageList } from '@/components/chat/message-list';
import { MessageInput } from '@/components/chat/message-input';
import { ErrorMessage } from '@/components/chat/error-message';
import { LogUploader } from '@/components/chat/log-uploader';

import { SignIn } from '@/components/auth/sign-in';
import { useAuth } from '@/lib/auth-context';
import { Loading } from '@/components/ui/loading';
import QueryPanel, { QueryPanelRef } from '@/components/chat/query-panel';
import { AppNavbar } from '@/components/app-navbar';
import { useRef } from 'react';
import { AIProviderWrapper } from '@/lib/ai-provider-context';
import { FileSidebar } from '@/components/chat/file-sidebar';
import { FileWrapper } from '@/lib/file-context';
import { RightSidebar } from '@/components/chat/right-sidebar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { ChatFunctionsProvider, useChatFunctions } from '@/lib/chat-functions-context';

function ChatContent() {
  const { session, status, isLoading } = useAuth();
  const queryPanelRef = useRef<QueryPanelRef>(null);
  
  const {
    messages,
    isLoading: chatLoading,
    sendMessage,
    clearChat,
    retryLastMessage,
    repeatMessage,
    editMessage,
  } = useChat();

  const handleEditMessage = (messageId: string) => {
    const messageContent = editMessage(messageId);
    if (messageContent && queryPanelRef.current) {
      queryPanelRef.current.setInputValue(messageContent);
    }
  };

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
      <div className="chatgpt-container flex h-screen flex-col">
        <AppNavbar className="h-16 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg" />
        <div className="chatgpt-main flex flex-col flex-1">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={75}>
              <div className="flex-1 flex flex-col min-h-0">
                <MessageList 
                  messages={messages} 
                  isTyping={chatLoading} 
                  onRepeatMessage={repeatMessage}
                  onEditMessage={handleEditMessage}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25}>
              <RightSidebar />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
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
