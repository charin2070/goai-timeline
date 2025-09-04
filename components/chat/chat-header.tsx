'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserProfile } from '@/components/auth/user-profile';
import { AiProviderInfo } from './ai-provider-info';
import { AIProvider } from '@/lib/types';

interface ChatHeaderProps {
  messageCount: number;
  onClearChat: () => void;
  selectedProvider: AIProvider;
}

export function ChatHeader({ messageCount, onClearChat, selectedProvider }: ChatHeaderProps) {
  return (
    <>
      <div className="border-b border-gray-800 px-4 py-3 bg-background">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-foreground text-primary">
              <span className="text-sm font-medium">G</span>
            </div>
            <div>
              <h1 className="font-medium text-foreground">GoAI Timeline</h1>
              <p className="text-sm text-muted-foreground">
                {messageCount === 0
                  ? 'Ready to chat'
                  : `${messageCount} ${messageCount === 1 ? 'message' : 'messages'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* AI Provider Info */}
            <AiProviderInfo
              provider={selectedProvider}
              showDescription={false}
              className="hidden md:flex"
            />

            {messageCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground border-border hover:bg-accent"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Chat
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">Clear Chat History</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      Are you sure you want to clear all messages? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onClearChat}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Clear Chat
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            
          </div>
        </div>
      </div>


    </>
  );
}