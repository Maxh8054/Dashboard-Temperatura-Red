/**
 * MaxReport Pro - Settings Page
 * Application settings and preferences
 */

'use client'

import { useAuthStore, useUIStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  Shield,
  Database,
  Download,
  Trash2,
  HelpCircle,
  Info,
  LogOut,
  Fingerprint,
  Globe,
  Volume2,
} from 'lucide-react'

export function SettingsPage() {
  const { user, logout, updateUser } = useAuthStore()
  const { theme, setTheme } = useUIStore()

  return (
    <div className="p-4 pb-24 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Configurações</h2>
        <p className="text-text-secondary text-sm">Personalize sua experiência</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground">{user?.name}</p>
              <p className="text-sm text-text-muted">{user?.email}</p>
              <p className="text-xs text-primary capitalize">{user?.role}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={user?.name || ''} readOnly className="bg-surface" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={user?.email || ''} readOnly className="bg-surface" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={user?.phone || ''} readOnly className="bg-surface" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Modo Escuro</p>
              <p className="text-sm text-text-muted">Ideal para ambientes com pouca luz</p>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-warning" />
              <span className="text-sm font-medium">Claro</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-info" />
              <span className="text-sm font-medium">Escuro</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-text-muted" />
              <div>
                <p className="font-medium text-foreground">Autenticação Biométrica</p>
                <p className="text-sm text-text-muted">Usar impressão digital ou Face ID</p>
              </div>
            </div>
            <Switch checked={user?.biometric} />
          </div>
          
          <Separator />
          
          <Button variant="outline" className="w-full justify-start">
            <Shield className="w-4 h-4 mr-3" />
            Alterar Senha
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Notificações Push</p>
              <p className="text-sm text-text-muted">Alertas de manutenção</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Sons</p>
              <p className="text-sm text-text-muted">Alertas sonoros</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-3" />
            Exportar Dados
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Database className="w-4 h-4 mr-3" />
            Backup Local
          </Button>
          <Button variant="outline" className="w-full justify-start text-danger hover:text-danger">
            <Trash2 className="w-4 h-4 mr-3" />
            Limpar Cache
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Sobre
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Versão</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Build</span>
            <span className="font-medium">2026.01.15</span>
          </div>
          <Separator />
          <Button variant="outline" className="w-full justify-start">
            <HelpCircle className="w-4 h-4 mr-3" />
            Central de Ajuda
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Globe className="w-4 h-4 mr-3" />
            Site Oficial
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-danger hover:text-danger hover:bg-danger/10"
        onClick={logout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair da Conta
      </Button>
    </div>
  )
}
