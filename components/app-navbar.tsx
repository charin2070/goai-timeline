'use client'

import { Navbar, NavbarSection, NavbarSpacer } from '@/components/catalyst-ui-kit/navbar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface AppNavbarProps {
  className?: string
}

export function AppNavbar({ className }: AppNavbarProps) {
  return (
    <Navbar className={`sticky top-0 z-50 flex-none bg-background/80 backdrop-blur-sm border-b border-border ${className}`}>
      <NavbarSpacer />
      
      <NavbarSection>
        <ThemeToggle />
      </NavbarSection>
    </Navbar>
  )
}
