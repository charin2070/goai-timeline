'use client';

import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
  SidebarFooter,
  SidebarSpacer,
} from '@/components/catalyst-ui-kit/sidebar';
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
} from '@/components/catalyst-ui-kit/dropdown';
import { Button } from '@/components/catalyst-ui-kit/button';
import { Avatar } from '@/components/catalyst-ui-kit/avatar';
import { useAuth } from '@/lib/auth-context';
import { Settings, LogOut, ChevronDown, Bot } from 'lucide-react';
import { LeftPanel } from './left-panel';

interface AppSidebarProps {
  onToggleSettings: () => void;
}

export function AppSidebar({ onToggleSettings }: AppSidebarProps) {
  const { session, signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarItem>
          <Bot className="w-6 h-6 text-primary" />
          <SidebarLabel>GoAI</SidebarLabel>
        </SidebarItem>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <LeftPanel />
        </SidebarSection>
        <SidebarSpacer />
      </SidebarBody>
      <SidebarFooter className="flex items-center justify-between gap-2">
        <Dropdown>
          <DropdownButton as={Button} plain className="flex items-center gap-3 text-left px-2 py-1">
            {session?.user?.image && <Avatar src={session.user.image} style={{ width: '2em', height: '2em' }} />}
            <SidebarLabel>{session?.user?.name}</SidebarLabel>
            <ChevronDown />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="top start">
            <DropdownItem onClick={() => signOut()}>
              <LogOut />
              <DropdownLabel>Выйти</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button plain onClick={onToggleSettings}>
          <Settings />
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}