'use client'

import { Navbar, NavbarSection, NavbarSpacer } from '@/components/catalyst-ui-kit/navbar'
import { UserProfile } from '@/components/auth/user-profile'
import { Button } from '@/components/ui/button'
import { Settings, Bot } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface AppNavbarProps {
  className?: string
  onToggleSidebar: () => void
}

export function AppNavbar({ className, onToggleSidebar }: AppNavbarProps) {
  return (
    <Navbar className={`flex-none bg-background/80 backdrop-blur-sm border-b border-border ${className}`}>
      <NavbarSection>
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">GoAI Timeline</h1>
        </div>
      </NavbarSection>
      
      <NavbarSpacer />
      
      <NavbarSection>
        <ThemeToggle />
        <Button variant="ghost" onClick={onToggleSidebar} className="mr-4">
          <Settings />
        </Button>
        <UserProfile />
      </NavbarSection>
    </Navbar>
  )
}