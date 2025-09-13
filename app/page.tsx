'use client';

import { useChat } from '@/hooks/use-chat';
import { SignIn } from '@/components/auth/sign-in';
import { useAuth } from '@/lib/auth-context';
import { Loading } from '@/components/ui/loading';
import { AIProviderWrapper } from '@/lib/ai-provider-context';
import { FileWrapper, useFileContext } from '@/lib/file-context'; // Import useFileContext
import { ChatFunctionsProvider } from '@/lib/chat-functions-context';
import { CenterPanel, CenterPanelRef } from '@/components/chat/center-panel';
import { useState, useRef } from 'react';
import { AppNavbar } from '@/components/app-navbar';
import { LocalSettings } from '@/components/local-settings';
import { AppSidebar } from '@/components/chat/app-sidebar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";



function ChatContent() {
  const { session, status, isLoading } = useAuth();
  const [pomlPrompt, setPomlPrompt] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { files } = useFileContext(); // Get files from context
  const [activeTab, setActiveTab] = useState("logContent"); // New state for active tab
  const centerPanelRef = useRef<CenterPanelRef>(null);
  
  const {
    messages,
    isLoading: chatLoading,
    sendMessage: originalSendMessage, // Rename original sendMessage
    clearChat,
    retryLastMessage,
    repeatMessage,
    editMessage,
  } = useChat();

  // Create a new sendMessage function that includes files
  const sendMessage = (query: string) => {
    originalSendMessage(query, files);
  };

  const handleAddFileAction = () => {
    if (centerPanelRef.current) {
      centerPanelRef.current.handleAddFileClick();
    }
  };

  if (isLoading || status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated' || !session) {
    return <SignIn />;
  }

  return (
    <ChatFunctionsProvider sendMessage={sendMessage} clearChat={clearChat}>
      <div className="flex h-screen flex-col bg-background text-foreground">
        {/* <AppNavbar /> */}
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20}>
            <AppSidebar onToggleSettings={() => setIsSettingsOpen(true)} onTabChange={setActiveTab} onAddFileAction={handleAddFileAction} fileCount={files.length} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <CenterPanel 
              ref={centerPanelRef}
              setPomlPrompt={setPomlPrompt}
              messages={messages}
              isTyping={chatLoading}
              onRepeatMessage={repeatMessage}
              editMessage={editMessage}
              onSendMessage={sendMessage}
              onClearChat={clearChat}
              initialPrompt={pomlPrompt}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
        <LocalSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
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
