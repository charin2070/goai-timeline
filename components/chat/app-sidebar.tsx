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
import { Settings, LogOut, ChevronDown, FileText, List, BarChart, Plus, Save, Sun, Moon } from 'lucide-react';
import { BoltIcon, FolderIcon, ArrowUpTrayIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/catalyst-ui-kit/badge';
import { LeftPanel } from './left-panel';
import { useTheme } from '@/lib/theme-context';

interface AppSidebarProps {
  onToggleSettings: () => void;
  onTabChange: (tab: string) => void;
  onAddFileAction: () => void;
  fileCount: number;
}

export function AppSidebar({ onToggleSettings, onTabChange, onAddFileAction, fileCount }: AppSidebarProps) {
  const { session, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Dropdown>
          <DropdownButton as={SidebarItem} className="mb-2.5">
            <img src="/logo-light.svg" alt="GoAI Timeline Logo" className="w-6 h-6" />
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
            <SidebarLabel>Данные</SidebarLabel>
            {fileCount > 0 && <Badge color="blue" className="ml-auto">{fileCount}</Badge>}
          </SidebarItem>
          
          {/* Fixed Events item - no nested button */}
          <div className="relative group">
            <SidebarItem onClick={() => { onTabChange('events'); }}>
              <BoltIcon className="w-6 h-6" />
              <SidebarLabel>События</SidebarLabel>
            </SidebarItem>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                onAddFileAction(); 
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Add event"
            >
              <PlusCircleIcon className="w-5 h-5" />
            </button>
          </div>

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
        <div className="flex items-center gap-2 w-full">
          <Dropdown>
            <DropdownButton as={Button} plain className="flex items-center justify-between w-full gap-3 text-left px-2 py-1">
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
          <Button plain onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
          <Button plain onClick={onToggleSettings} title="Settings">
            <Settings />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}