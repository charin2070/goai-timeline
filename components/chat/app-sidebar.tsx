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
  DropdownDivider,
} from '@/components/catalyst-ui-kit/dropdown';
import { Button } from '@/components/catalyst-ui-kit/button';
import { Avatar } from '@/components/catalyst-ui-kit/avatar';
import { useAuth } from '@/lib/auth-context';
import { Settings, LogOut, ChevronDown, Bot, FileText, List, BarChart, Plus, Save } from 'lucide-react';
import { BoltIcon, FolderIcon, ArrowUpTrayIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/catalyst-ui-kit/badge';
import { LeftPanel } from './left-panel';

interface AppSidebarProps {
  onToggleSettings: () => void;
  onTabChange: (tab: string) => void;
  onAddFileAction: () => void;
  fileCount: number;
}

export function AppSidebar({ onToggleSettings, onTabChange, onAddFileAction, fileCount }: AppSidebarProps) {
  const { session, signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        <Dropdown>
          <DropdownButton as={SidebarItem} className="mb-2.5">
            <Bot className="w-6 h-6 text-primary" />
            <SidebarLabel>Инциденты</SidebarLabel>
            <ChevronDown />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="bottom start">
            <DropdownItem onClick={() => { /* handle new incident */ }}>
              <Plus className="w-4 h-4 mr-2" />
              <DropdownLabel>Новый</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={() => { /* handle save incident */ }}>
              <Save className="w-4 h-4 mr-2" />
              <DropdownLabel>Сохранить</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
          </DropdownMenu>
        </Dropdown>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem onClick={() => { onTabChange('files'); }}>
            <FolderIcon className="w-6 h-6" />
            <SidebarLabel>Файлы</SidebarLabel>
            {fileCount > 0 && <Badge color="blue" className="ml-auto">{fileCount}</Badge>}
          </SidebarItem>
          <SidebarItem onClick={() => { onTabChange('events'); }}>
            <BoltIcon className="w-6 h-6" />
            <SidebarLabel>События</SidebarLabel>
            <Button plain onClick={(e: { stopPropagation: () => void; }) => { e.stopPropagation(); onAddFileAction(); }} className="ml-auto">
              <PlusCircleIcon className="w-5 h-5" />
            </Button>
          </SidebarItem>
          <SidebarItem onClick={() => onTabChange('analysis')}>
            <BarChart className="w-6 h-6" />
            <SidebarLabel>Анализ</SidebarLabel>
          </SidebarItem>
          <SidebarItem onClick={onToggleSettings}>
            <Settings className="w-6 h-6" />
            <SidebarLabel>Настройки</SidebarLabel>
          </SidebarItem>
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