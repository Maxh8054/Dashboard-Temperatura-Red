/**
 * MaxReport Pro - Main Layout
 * Mobile-first layout with sidebar navigation
 * Light Theme - White Background + Orange Accent
 */

'use client'

import { useAuthStore, useUIStore, useReportStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { StorageIndicator } from '@/components/ui/StorageIndicator'
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Menu,
  Plus,
  User,
  Wrench,
  HardHat,
  Moon,
  Sun,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
}

interface NavContentProps {
  user: { name?: string } | null
  activeView: string
  theme: 'light' | 'dark' | 'system'
  reportHistoryLength: number
  onNavClick: (view: string) => void
  onToggleTheme: () => void
  onLogout: () => void
}

function NavContent({ 
  user, 
  activeView, 
  theme, 
  reportHistoryLength, 
  onNavClick, 
  onToggleTheme, 
  onLogout 
}: NavContentProps) {
  const navItems: { id: string; label: string; icon: LucideIcon; badge?: number }[] = [
    { id: 'history', label: 'Relatórios', icon: History, badge: reportHistoryLength },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '40px', 
            height: '40px', 
            borderRadius: '8px', 
            backgroundColor: '#ff6600' 
          }}>
            <HardHat style={{ width: '20px', height: '20px', color: '#ffffff' }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 'bold', color: '#333333' }}>Z-Report</h2>
            <p style={{ fontSize: '12px', color: '#787878' }}>v1.0.0</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar style={{ width: '40px', height: '40px' }}>
            <AvatarFallback style={{ backgroundColor: '#ff6600', color: '#ffffff' }}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 500, color: '#333333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize: '12px', color: '#787878' }}>Técnico</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onNavClick(item.id)}
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                borderRadius: '8px', 
                textAlign: 'left', 
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? 'rgba(255, 102, 0, 0.1)' : 'transparent',
                color: isActive ? '#ff6600' : '#505050',
                transition: 'background-color 0.15s'
              }}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge style={{ backgroundColor: 'rgba(255, 102, 0, 0.2)', color: '#ff6600' }}>
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight style={{ width: '16px', height: '16px' }} />}
            </button>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: '16px', borderTop: '1px solid #e5e5e5' }}>
        <button
          onClick={onLogout}
          style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '12px', 
            borderRadius: '8px', 
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: '#ef4444',
            transition: 'background-color 0.15s'
          }}
        >
          <LogOut style={{ width: '20px', height: '20px' }} />
          <span style={{ fontWeight: 500 }}>Sair</span>
        </button>
      </div>
    </div>
  )
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, activeView, setActiveView, theme, setTheme } = useUIStore()
  const { openWizard, reportHistory } = useReportStore()

  const handleNavClick = (view: string) => {
    setActiveView(view as typeof activeView)
    setSidebarOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Top Header Bar */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 40, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        height: '56px', 
        padding: '0 16px', 
        borderBottom: '1px solid #e5e5e5', 
        backgroundColor: '#ffffff'
      }}>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" style={{ width: '44px', height: '44px', color: '#333333' }}>
              <Menu style={{ width: '24px', height: '24px' }} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" style={{ width: '288px', padding: 0, backgroundColor: '#ffffff' }}>
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            <NavContent 
              user={user}
              activeView={activeView}
              theme={theme}
              reportHistoryLength={reportHistory.length}
              onNavClick={handleNavClick}
              onToggleTheme={toggleTheme}
              onLogout={logout}
            />
          </SheetContent>
        </Sheet>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench style={{ width: '20px', height: '20px', color: '#ff6600' }} />
          <h1 style={{ fontWeight: 600, color: '#333333' }} className="hidden sm:inline">Z-Report</h1>
        </div>

        {/* Storage Indicator */}
        <StorageIndicator />
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fafafa' }}>
        {children}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => openWizard()}
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          zIndex: 50, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          backgroundColor: '#ff6600', 
          color: '#ffffff', 
          boxShadow: '0 4px 12px rgba(255, 102, 0, 0.4)', 
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.15s'
        }}
        aria-label="Novo Relatório"
      >
        <Plus style={{ width: '24px', height: '24px' }} />
      </button>
    </div>
  )
}
