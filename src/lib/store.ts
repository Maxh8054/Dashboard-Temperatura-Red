/**
 * MaxReport Pro - Global State Management
 * Zustand store with API integration for server-side storage
 */

import { create } from 'zustand'

// ============================================
// API HELPERS
// ============================================

async function apiGet(endpoint: string) {
  const res = await fetch(`/api${endpoint}`)
  return res.json()
}

async function apiPost(endpoint: string, data: any) {
  const res = await fetch(`/api${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

async function apiPut(endpoint: string, data: any) {
  const res = await fetch(`/api${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

async function apiDelete(endpoint: string) {
  const res = await fetch(`/api${endpoint}`, {
    method: 'DELETE'
  })
  return res.json()
}

// ============================================
// USERS DATA (for dropdown)
// ============================================

export const USERS = [
  { id: 'user-1', name: 'Max Henrique', email: 'max@maxreport.com', role: 'technician' },
  { id: 'user-2', name: 'Marcos Paulo', email: 'marcos@maxreport.com', role: 'technician' },
  { id: 'user-3', name: 'Marcelo Gonçalves', email: 'marcelo@maxreport.com', role: 'technician' },
  { id: 'user-4', name: 'Wesley Ferreira', email: 'wesley@maxreport.com', role: 'technician' },
  { id: 'user-5', name: 'Higor Ataides', email: 'higor@maxreport.com', role: 'technician' },
]

// ============================================
// AUTH STORE
// ============================================

interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  phone?: string
  biometric: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (name: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (name: string, password: string) => {
    try {
      const result = await apiPost('/auth/login', { name, password })
      
      if (result.user) {
        set({ 
          user: { ...result.user, biometric: false }, 
          isAuthenticated: true,
          isLoading: false 
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  },
  
  logout: async () => {
    try {
      await apiPost('/auth/logout', {})
    } catch (error) {
      console.error('Logout error:', error)
    }
    set({ user: null, isAuthenticated: false })
  },
  
  checkAuth: async () => {
    try {
      const result = await apiGet('/auth/me')
      
      if (result.user) {
        set({ 
          user: { ...result.user, biometric: false }, 
          isAuthenticated: true,
          isLoading: false 
        })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch (error) {
      console.error('Check auth error:', error)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
  
  updateUser: (userData) => 
    set((state) => ({ 
      user: state.user ? { ...state.user, ...userData } : null 
    })),
}))

// ============================================
// SERVICE WITH PHOTOS
// ============================================

export interface ServicePhoto {
  id: string
  type: 'before' | 'after' | 'general'
  imageData: string
  editedImageData?: string
  annotations?: string
}

export interface ServicePerformed {
  id: string
  description: string
  photos: ServicePhoto[]
}

// ============================================
// MACHINE ENTRY
// ============================================

export const CORRECTIVE_CATEGORIES = [
  'Mecânica', 'Hidráulica', 'Elétrica', 'Eletrônica / Controle', 'Motor',
  'Lubrificação', 'Arrefecimento', 'Transmissão / Tração', 'Estrutural',
  'Segurança / Intertravamento', 'Pneumática', 'Combustível', 'Admissão de Ar',
  'Exaustão', 'Freios', 'Direção', 'Suspensão', 'Sistema de Giro',
  'Sistema de Implementos', 'Ar Condicionado', 'Sistema de Partida',
  'Sistema de Carga', 'Instrumentação', 'Telemetria', 'Automação',
  'Sistema de Filtragem', 'Sistema de Refrigeração de Óleo', 'Sistema de Eixo / Rodagem',
  'Sistema de Esteiras', 'Sistema de Caçamba / Concha', 'Sistema de Iluminação',
  'Sistema de Monitoramento', 'Sistema de Proteção Contra Incêndio',
  'Sistema de Pressurização de Cabine', 'Sistema de Ar Comprimido', 'Outros',
] as const

export const PROGRAMADA_CATEGORIES = [
  'Parada Programada', 'Manutenção Majorada', 'Overhaul', 'Reforma', 'Retrofiitação',
  'Troca de Componente Major', 'Inspeção Detalhada', 'Auditoria de Manutenção',
  'Calibração Especial', 'Teste de Performance', 'Modernização', 'Substituição de Conjunto',
  'Reparo Estrutural', 'Pintura / Proteção', 'Outros',
] as const

export const WEATHER_TYPES = ['Ensolarado', 'Nublado', 'Chuva'] as const

export interface Desvio {
  id: string
  description: string
  time: string
  endTime?: string
}

export interface Displacement {
  id: string
  from: string
  to: string
  startTime: string
  endTime: string
  observacao?: string  // Novo campo de observação
}

export interface MachineEntry {
  id: string
  equipmentId?: string
  equipmentName?: string
  hourMeter?: string  // Obrigatório - formato string
  location?: string   // Obrigatório
  machinePhoto?: string
  maintenanceType: 'preventive' | 'corrective' | 'programada' | 'inspection' | 'operando' | ''
  priority: 'low' | 'normal' | 'high' | 'critical'
  downtimeTime?: string  // Formato 00:00:00
  correctiveCategories: string[]
  correctiveOther?: string
  programadaEvent?: string
  programadaCategories: string[]
  programadaOther?: string
  services: ServicePerformed[]
  download: boolean
  downloadPhoto?: string
  conclusao?: string
  desvios: Desvio[]
  deslocamentos: Displacement[]
  pendingItems?: string
  isComplete: boolean
}

const createEmptyMachine = (): MachineEntry => ({
  id: `machine-${Date.now()}`,
  maintenanceType: '',
  priority: 'normal',
  services: [],
  correctiveCategories: [],
  programadaCategories: [],
  download: false,
  desvios: [],
  deslocamentos: [],
  isComplete: false,
})

// ============================================
// REPORT STORE
// ============================================

export interface ReportDraft {
  id?: string
  reportNumber?: string
  status: 'draft' | 'pending' | 'completed' | 'approved'
  date: string
  startTime: string
  endTime?: string
  shift: 'day' | 'night' | ''
  technicianName?: string
  ddsTheme: string  // Obrigatório
  weather?: string
  machines: MachineEntry[]
  signaturePhoto?: string
  createdBy?: string
  createdAt?: string
}

interface ReportState {
  currentReport: ReportDraft | null
  currentMachineIndex: number
  reportHistory: ReportDraft[]
  isWizardOpen: boolean
  wizardStep: number
  isLoading: boolean
  
  // Report Actions
  setCurrentReport: (report: ReportDraft | null) => void
  updateCurrentReport: (data: Partial<ReportDraft>) => void
  setSignaturePhoto: (photo: string) => void
  openWizard: () => void
  startNewReport: () => void
  closeWizard: () => void
  setWizardStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  saveReport: () => Promise<void>
  clearCurrentReport: () => void
  editReport: (report: ReportDraft) => void
  deleteReport: (reportId: string) => Promise<void>
  loadReports: () => Promise<void>
  
  // Machine Actions
  getCurrentMachine: () => MachineEntry | null
  addMachine: () => void
  selectMachine: (index: number) => void
  updateCurrentMachine: (data: Partial<MachineEntry>) => void
  removeMachine: (index: number) => void
  markMachineComplete: () => void
  
  // Service Actions
  addService: (service: ServicePerformed) => void
  updateService: (id: string, data: Partial<ServicePerformed>) => void
  removeService: (id: string) => void
  
  // Photo Actions
  addPhotoToService: (serviceId: string, photo: ServicePhoto) => void
  updatePhotoInService: (serviceId: string, photoId: string, data: Partial<ServicePhoto>) => void
  removePhotoFromService: (serviceId: string, photoId: string) => void
  
  // Download Actions
  setDownload: (value: boolean) => void
  setDownloadPhoto: (photo: string) => void
  
  // Desvio Actions (mudou de Intervention)
  addDesvio: (desvio: Desvio) => void
  removeDesvio: (id: string) => void
  
  // Displacement Actions
  addDeslocamento: (deslocamento: Displacement) => void
  removeDeslocamento: (id: string) => void
  
  // Draft Actions
  clearDraft: () => void
}

const initialReport: ReportDraft = {
  status: 'draft',
  date: new Date().toISOString().split('T')[0],
  startTime: new Date().toTimeString().slice(0, 5),
  shift: '',
  technicianName: '',
  ddsTheme: '',
  weather: '',
  machines: [createEmptyMachine()],
}

export const useReportStore = create<ReportState>()((set, get) => ({
  currentReport: null,
  currentMachineIndex: 0,
  reportHistory: [],
  isWizardOpen: false,
  wizardStep: 0,
  isLoading: true,
  
  // Load reports from API
  loadReports: async () => {
    set({ isLoading: true })
    try {
      const result = await apiGet('/reports')
      set({ reportHistory: result.reports || [], isLoading: false })
    } catch (error) {
      console.error('Load reports error:', error)
      set({ reportHistory: [], isLoading: false })
    }
  },
  
  // Report Actions
  setCurrentReport: (report) => set({ currentReport: report }),
  
  updateCurrentReport: (data) => 
    set((state) => ({
      currentReport: state.currentReport 
        ? { ...state.currentReport, ...data }
        : { ...initialReport, ...data }
    })),
  
  setSignaturePhoto: (photo) =>
    set((state) => ({
      currentReport: state.currentReport
        ? { ...state.currentReport, signaturePhoto: photo }
        : null
    })),
  
  openWizard: () => {
    const state = get()
    if (state.currentReport && !state.currentReport.reportNumber) {
      set({ 
        isWizardOpen: true, 
        wizardStep: state.wizardStep || 0, 
        currentMachineIndex: state.currentMachineIndex || 0
      })
    } else {
      set({ 
        isWizardOpen: true, 
        wizardStep: 0, 
        currentReport: initialReport,
        currentMachineIndex: 0
      })
    }
  },
  
  startNewReport: () => set({ 
    isWizardOpen: true, 
    wizardStep: 0, 
    currentReport: initialReport,
    currentMachineIndex: 0
  }),
  
  closeWizard: () => set({ isWizardOpen: false }),
  
  setWizardStep: (step) => set({ wizardStep: step }),
  
  nextStep: () => set((state) => ({ wizardStep: state.wizardStep + 1 })),
  
  prevStep: () => set((state) => ({ wizardStep: Math.max(0, state.wizardStep - 1) })),
  
  saveReport: async () => {
    const state = get()
    if (state.currentReport) {
      try {
        let result
        
        if (state.currentReport.id) {
          // Update existing report
          result = await apiPut('/reports', {
            reportId: state.currentReport.id,
            report: state.currentReport
          })
        } else {
          // Create new report
          result = await apiPost('/reports', {
            report: state.currentReport,
            createdBy: useAuthStore.getState().user?.id
          })
        }
        
        if (result.report) {
          // Reload reports from server
          await get().loadReports()
          set({ currentReport: null, isWizardOpen: false })
        }
      } catch (error) {
        console.error('Save report error:', error)
        alert('Erro ao salvar relatório')
      }
    }
  },
  
  clearCurrentReport: () => set({ currentReport: null, currentMachineIndex: 0 }),
  
  editReport: (report) => {
    const machinesWithResetComplete = report.machines.map(m => ({
      ...m,
      isComplete: false
    }))
    
    set({ 
      currentReport: { 
        ...report, 
        machines: machinesWithResetComplete 
      }, 
      currentMachineIndex: 0,
      isWizardOpen: true,
      wizardStep: 0
    })
  },
  
  deleteReport: async (reportId: string) => {
    try {
      await apiDelete(`/reports?id=${reportId}`)
      await get().loadReports()
    } catch (error) {
      console.error('Delete report error:', error)
      alert('Erro ao excluir relatório')
    }
  },
  
  // Machine Actions
  getCurrentMachine: () => {
    const state = get()
    if (!state.currentReport || !state.currentReport.machines.length) return null
    return state.currentReport.machines[state.currentMachineIndex] || null
  },
  
  addMachine: () => {
    set((state) => {
      if (!state.currentReport) return state
      const newMachine = createEmptyMachine()
      return {
        currentReport: {
          ...state.currentReport,
          machines: [...state.currentReport.machines, newMachine]
        },
        currentMachineIndex: state.currentReport.machines.length,
        wizardStep: 1
      }
    })
  },
  
  selectMachine: (index) => set({ 
    currentMachineIndex: index,
    wizardStep: 1
  }),
  
  updateCurrentMachine: (data) => 
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        ...data
      }
      return {
        currentReport: { ...state.currentReport, machines }
      }
    }),
  
  removeMachine: (index) =>
    set((state) => {
      if (!state.currentReport || state.currentReport.machines.length <= 1) return state
      const machines = state.currentReport.machines.filter((_, i) => i !== index)
      const newIndex = Math.min(state.currentMachineIndex, machines.length - 1)
      return {
        currentReport: { ...state.currentReport, machines },
        currentMachineIndex: newIndex
      }
    }),
  
  markMachineComplete: () =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        isComplete: true
      }
      return {
        currentReport: { ...state.currentReport, machines }
      }
    }),
  
  // Service Actions
  addService: (service) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        services: [...machines[state.currentMachineIndex].services, service]
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  updateService: (id, data) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        services: machines[state.currentMachineIndex].services.map((s) =>
          s.id === id ? { ...s, ...data } : s
        )
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  removeService: (id) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        services: machines[state.currentMachineIndex].services.filter((s) => s.id !== id)
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  // Photo Actions
  addPhotoToService: (serviceId, photo) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        services: machines[state.currentMachineIndex].services.map((s) =>
          s.id === serviceId 
            ? { ...s, photos: [...s.photos, photo] }
            : s
        )
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  updatePhotoInService: (serviceId, photoId, data) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        services: machines[state.currentMachineIndex].services.map((s) =>
          s.id === serviceId 
            ? {
                ...s,
                photos: s.photos.map((p) =>
                  p.id === photoId ? { ...p, ...data } : p
                )
              }
            : s
        )
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  removePhotoFromService: (serviceId, photoId) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        services: machines[state.currentMachineIndex].services.map((s) =>
          s.id === serviceId 
            ? { ...s, photos: s.photos.filter((p) => p.id !== photoId) }
            : s
        )
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  // Download Actions
  setDownload: (value) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        download: value,
        downloadPhoto: value ? machines[state.currentMachineIndex].downloadPhoto : undefined
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  setDownloadPhoto: (photo) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        downloadPhoto: photo
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  // Desvio Actions (mudou de Intervention para Desvio)
  addDesvio: (desvio) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        desvios: [...machines[state.currentMachineIndex].desvios, desvio]
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  removeDesvio: (id) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        desvios: machines[state.currentMachineIndex].desvios.filter((d) => d.id !== id)
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  // Displacement Actions
  addDeslocamento: (deslocamento) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        deslocamentos: [...machines[state.currentMachineIndex].deslocamentos, deslocamento]
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  removeDeslocamento: (id) =>
    set((state) => {
      if (!state.currentReport) return state
      const machines = [...state.currentReport.machines]
      machines[state.currentMachineIndex] = {
        ...machines[state.currentMachineIndex],
        deslocamentos: machines[state.currentMachineIndex].deslocamentos.filter((d) => d.id !== id)
      }
      return { currentReport: { ...state.currentReport, machines } }
    }),
  
  clearDraft: () => set({ 
    currentReport: null, 
    currentMachineIndex: 0,
    wizardStep: 0
  }),
}))

// ============================================
// UI STORE
// ============================================

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  activeView: 'dashboard' | 'reports' | 'history' | 'about' | 'settings'
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setActiveView: (view: UIState['activeView']) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  theme: 'dark',
  activeView: 'dashboard',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setActiveView: (activeView) => set({ activeView }),
}))

// ============================================
// EQUIPMENT STORE
// ============================================

interface Equipment {
  id: string
  code: string
  name: string
  type: string
  model?: string
  location?: string
  hourMeter?: number
}

interface EquipmentState {
  equipment: Equipment[]
  addEquipment: (eq: Equipment) => void
  setEquipment: (equipment: Equipment[]) => void
}

export const useEquipmentStore = create<EquipmentState>()((set) => ({
  equipment: [
    { id: 'eh-01', code: 'EH-01', name: 'EH-01', type: 'excavator' },
    { id: 'eh-02', code: 'EH-02', name: 'EH-02', type: 'excavator' },
    { id: 'eh-03', code: 'EH-03', name: 'EH-03', type: 'excavator' },
  ],
  addEquipment: (eq) => set((state) => ({ 
    equipment: [...state.equipment, eq] 
  })),
  setEquipment: (equipment) => set({ equipment }),
}))
