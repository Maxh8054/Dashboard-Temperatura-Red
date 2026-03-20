'use client';

import { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  backupAction?: 'export' | 'import';
  selectedTab?: 'temperatura' | 'alarmes' | 'ambos';
  onTabChange?: (tab: 'temperatura' | 'alarmes' | 'ambos') => void;
  showTabSelector?: boolean;
}

export function PasswordModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  description,
  backupAction,
  selectedTab = 'ambos',
  onTabChange,
  showTabSelector = false
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password === '2026') {
      setPassword('');
      setError('');
      onConfirm();
      onOpenChange(false);
    } else {
      setError('Senha incorreta!');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {showTabSelector && (
            <div className="grid gap-2">
              <Label>
                {backupAction === 'export' ? 'O que deseja exportar?' : 'O que deseja importar?'}
              </Label>
              <Select value={selectedTab} onValueChange={(v) => onTabChange?.(v as 'temperatura' | 'alarmes' | 'ambos')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambos">Ambas as abas</SelectItem>
                  <SelectItem value="temperatura">Apenas Temperatura</SelectItem>
                  <SelectItem value="alarmes">Apenas Alarmes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="password">Senha de Administrador</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Digite a senha"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} style={{ backgroundColor: '#FF6600', color: 'white' }}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
