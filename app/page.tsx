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
import { AppNavbar } from '@/components/app-navbar';
import { motion } from 'framer-motion';
import { LocalSettings } from '@/components/local-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ChatContent() {
  const { session, status, isLoading } = useAuth();
  const [pomlPrompt, setPomlPrompt] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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
        <AppNavbar onToggleSidebar={() => setIsSettingsOpen(true)} />

        {/* Desktop layout */}
        <div className="hidden md:flex h-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20}>
              <motion.div initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                <LeftPanel />
              </motion.div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }} className="h-full">
                <CenterPanel setPomlPrompt={setPomlPrompt} />
              </motion.div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40}>
              <motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="h-full">
                <RightPanel 
                  messages={messages}
                  isTyping={chatLoading}
                  onRepeatMessage={repeatMessage}
                  editMessage={editMessage}
                  onSendMessage={sendMessage}
                  onClearChat={clearChat}
                  initialPrompt={pomlPrompt}
                />
              </motion.div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden h-full">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsContent value="files" className="flex-1 overflow-y-auto">
              <LeftPanel />
            </TabsContent>
            <TabsContent value="poml" className="flex-1 overflow-y-auto">
              <CenterPanel setPomlPrompt={setPomlPrompt} />
            </TabsContent>
            <TabsContent value="chat" className="flex-1 overflow-y-auto">
              <RightPanel 
                messages={messages}
                isTyping={chatLoading}
                onRepeatMessage={repeatMessage}
                editMessage={editMessage}
                onSendMessage={sendMessage}
                onClearChat={clearChat}
                initialPrompt={pomlPrompt}
              />
            </TabsContent>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="poml">PAML</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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