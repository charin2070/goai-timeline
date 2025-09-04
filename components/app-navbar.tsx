'use client'

import { Navbar, NavbarSection, NavbarSpacer } from '@/components/catalyst-ui-kit/navbar'
import { UserProfile } from '@/components/auth/user-profile'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

interface AppNavbarProps {
  className?: string
  onToggleSidebar: () => void
}

export function AppNavbar({ className, onToggleSidebar }: AppNavbarProps) {
  return (
    <Navbar className={`${className}`}>
      <NavbarSpacer />
      
      <NavbarSection>
        <Button variant="ghost" onClick={onToggleSidebar} className="mr-4">
          <Settings />
        </Button>
        <UserProfile />
      </NavbarSection>
    </Navbar>
  )
}
