/**
 * MaxReport Pro - Login Form
 * Login with name as ID and password
 * Light Theme - White Background + Orange Accent
 */

'use client'

import { useState } from 'react'
import { useAuthStore, USERS } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  HardHat,
  ChevronDown,
} from 'lucide-react'

export function LoginForm() {
  const login = useAuthStore((state) => state.login)
  const [selectedName, setSelectedName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showUserList, setShowUserList] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    if (!selectedName) {
      setError('Selecione um usuário')
      setIsLoading(false)
      return
    }

    if (!password) {
      setError('Digite a senha')
      setIsLoading(false)
      return
    }

    const success = login(selectedName, password)
    
    if (!success) {
      setError('Nome ou senha incorretos')
    }
    
    setIsLoading(false)
  }

  const handleQuickLogin = (name: string) => {
    setSelectedName(name)
    setPassword('2026')
    setError('')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#ffffff',
      padding: '16px'
    }}>
      {/* Logo and Title */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '80px', 
          height: '80px', 
          borderRadius: '16px', 
          backgroundColor: '#ff6600', 
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)'
        }}>
          <HardHat style={{ width: '40px', height: '40px', color: '#ffffff' }} />
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#333333' }}>MaxReport Pro</h1>
        <p style={{ color: '#787878', marginTop: '8px' }}>Sistema de Relatórios Técnicos</p>
      </div>

      {/* Login Card */}
      <Card style={{ 
        width: '100%', 
        maxWidth: '400px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e5e5'
      }}>
        <CardHeader style={{ paddingBottom: '8px' }}>
          <CardTitle style={{ fontSize: '20px', color: '#333333' }}>Acesso ao Sistema</CardTitle>
          <CardDescription style={{ color: '#787878' }}>
            Selecione seu nome e digite a senha
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Error Message */}
            {error && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px', 
                borderRadius: '6px', 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                color: '#ef4444', 
                fontSize: '14px' 
              }}>
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* User Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label style={{ color: '#505050' }}>Nome (ID)</Label>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowUserList(!showUserList)}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    height: '48px', 
                    padding: '0 16px', 
                    borderRadius: '6px', 
                    border: '1px solid #dcdcdc', 
                    backgroundColor: '#ffffff', 
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <User style={{ width: '20px', height: '20px', color: '#787878' }} />
                    <span style={{ color: selectedName ? '#333333' : '#787878' }}>
                      {selectedName || 'Selecione seu nome'}
                    </span>
                  </div>
                  <ChevronDown style={{ 
                    width: '20px', 
                    height: '20px', 
                    color: '#787878', 
                    transform: showUserList ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }} />
                </button>
                
                {showUserList && (
                  <div style={{ 
                    position: 'absolute', 
                    zIndex: 10, 
                    width: '100%', 
                    marginTop: '4px', 
                    padding: '4px 0', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e5e5', 
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {USERS.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedName(user.name)
                          setShowUserList(false)
                          setError('')
                        }}
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          textAlign: 'left', 
                          backgroundColor: selectedName === user.name ? 'rgba(255, 102, 0, 0.1)' : 'transparent',
                          color: selectedName === user.name ? '#ff6600' : '#333333',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedName !== user.name) {
                            e.currentTarget.style.backgroundColor = '#f5f5f5'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedName !== user.name) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        {user.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Label htmlFor="password" style={{ color: '#505050' }}>Senha</Label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#787878' }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px', paddingRight: '40px', height: '48px', backgroundColor: '#ffffff', color: '#333333', borderColor: '#dcdcdc' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#787878' }}
                >
                  {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              style={{ 
                width: '100%', 
                height: '48px', 
                fontSize: '16px', 
                fontWeight: 600, 
                backgroundColor: '#ff6600', 
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTopColor: '#ffffff', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }} />
                  Entrando...
                </span>
              ) : (
                'ENTRAR'
              )}
            </Button>
          </form>

          {/* Quick Login Buttons */}
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '12px', color: '#787878', marginBottom: '12px', textAlign: 'center' }}>Acesso rápido:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {USERS.slice(0, 3).map((user) => (
                <Button
                  key={user.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin(user.name)}
                  style={{ fontSize: '12px', backgroundColor: '#ffffff', color: '#333333', borderColor: '#dcdcdc' }}
                >
                  {user.name.split(' ')[0]}
                </Button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
              {USERS.slice(3).map((user) => (
                <Button
                  key={user.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin(user.name)}
                  style={{ fontSize: '12px', backgroundColor: '#ffffff', color: '#333333', borderColor: '#dcdcdc' }}
                >
                  {user.name.split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#787878' }}>
        <p>© 2026 Z-Report - Zamine</p>
        <p style={{ marginTop: '4px' }}>Versão 1.0.0</p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
