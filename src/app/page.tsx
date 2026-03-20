'use client'

import { useState, useMemo, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  Thermometer, 
  Activity,
  Download,
  BarChart3,
  LineChartIcon,
  PieChartIcon,
  RotateCcw,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Lock,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Search,
  Navigation
} from 'lucide-react';
import { PasswordModal } from '@/components/PasswordModal';

const COLORS = {
  below84: '#10b981',
  range84to96: '#f59e0b',
  above97: '#ef4444',
  primary: '#FF6600',
  secondary: '#FF8533',
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const MACHINE_COLORS: Record<string, string> = {
  'RED04': '#FF6600',
  'RED01': '#3b82f6',
  'RED02': '#10b981',
  'RED03': '#8b5cf6',
  'RED05': '#f59e0b',
  'Máquina 1': '#FF6600',
  'Máquina 2': '#3b82f6',
  'Máquina 3': '#10b981',
};

// Interface para dados de alarme
interface AlarmRecord {
  date: Date;
  dateStr: string;
  code: string;
  name: string;
  machine: string;
}

// Interface para dados de temperatura
interface TempRecord {
  date: Date;
  dateStr: string;
  machine: string;
  tempBelow84: number;
  temp84to96: number;
  temp97Above: number;
  parsedDate: Date;
}

// Parse Excel date
const parseExcelDate = (value: unknown): { date: Date; dateStr: string } => {
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { date, dateStr };
  }
  
  const dateStr = String(value);
  
  // Formato: "01/06/2023 06:03"
  const match1 = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s*(\d{2})?:?(\d{2})?/);
  if (match1) {
    const [, day, month, year, hour = '0', min = '0'] = match1;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min));
    return { date, dateStr };
  }
  
  // Formato: "1/6/2023 06:03"
  const match2 = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(\d{1,2})?:?(\d{2})?/);
  if (match2) {
    const [, day, month, year, hour = '0', min = '0'] = match2;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(min));
    return { date, dateStr };
  }
  
  const date = new Date(dateStr);
  return { date, dateStr };
};

// Parse de data para temperatura - formato "Sep. 1 2025" ou "01/09/2025"
const parseTempDate = (value: unknown): { date: Date; dateStr: string } => {
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('pt-BR');
    return { date, dateStr };
  }
  
  const dateStr = String(value).trim();
  
  // Month names mapping
  const monthNames: Record<string, number> = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'sept': 8, 'oct': 9, 'nov': 10, 'dec': 11,
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
  };
  
  // Formato: "Sep. 1 2025" ou "September 1 2025"
  const match1 = dateStr.match(/^(\w+)\.?\s+(\d{1,2})\s+(\d{4})$/i);
  if (match1) {
    const [, monthStr, day, year] = match1;
    const month = monthNames[monthStr.toLowerCase()];
    if (month !== undefined) {
      const date = new Date(parseInt(year), month, parseInt(day));
      return { date, dateStr: date.toLocaleDateString('pt-BR') };
    }
  }
  
  // Formato: "01/09/2025" (DD/MM/YYYY)
  const match2 = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match2) {
    const [, day, month, year] = match2;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return { date, dateStr };
  }
  
  // Formato: "1/9/2025" (D/M/YYYY)
  const match3 = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match3) {
    const [, day, month, year] = match3;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return { date, dateStr };
  }
  
  // Try native Date parse
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return { date, dateStr: date.toLocaleDateString('pt-BR') };
  }
  
  // Fallback
  return { date: new Date(), dateStr };
};

// Parse de número - aceita vírgula como decimal
const parseNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(',', '.').trim();
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

// ==================== TOOLTIPS ====================

function TempTrendCustomTooltip({ active, payload, label, rawData }: { active?: boolean; payload?: any[]; label?: string; rawData: TempRecord[] }) {
  if (!active || !payload || !label) return null;
  
  // Filtrar dados brutos pela data para mostrar breakdown por máquina
  const recordsForDate = rawData.filter(d => d.dateStr === label);
  const totalBelow84 = recordsForDate.reduce((sum, r) => sum + r.tempBelow84, 0);
  const total84to96 = recordsForDate.reduce((sum, r) => sum + r.temp84to96, 0);
  const total97Above = recordsForDate.reduce((sum, r) => sum + r.temp97Above, 0);
  
  const machineData: Record<string, { below84: number; mid: number; above: number }> = {};
  recordsForDate.forEach(r => {
    if (!machineData[r.machine]) machineData[r.machine] = { below84: 0, mid: 0, above: 0 };
    machineData[r.machine].below84 += r.tempBelow84;
    machineData[r.machine].mid += r.temp84to96;
    machineData[r.machine].above += r.temp97Above;
  });
  
  return (
    <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg max-w-xs">
      <p className="font-semibold text-slate-700 mb-2 border-b pb-1">{label}</p>
      {Object.keys(machineData).length > 1 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-500 mb-1">Por Máquina:</p>
          {Object.entries(machineData).map(([machine, data]) => (
            <div key={machine} className="text-xs mb-1">
              <span className="font-medium" style={{ color: MACHINE_COLORS[machine] || '#FF6600' }}>{machine}:</span>
              {' '}<span className="text-emerald-600">{data.below84.toFixed(1)}h</span>
              {' / '}<span className="text-amber-600">{data.mid.toFixed(1)}h</span>
              {' / '}<span className="text-red-600">{data.above.toFixed(1)}h</span>
            </div>
          ))}
        </div>
      )}
      {Object.keys(machineData).length === 1 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-500 mb-1">Máquina: <span style={{ color: MACHINE_COLORS[Object.keys(machineData)[0]] || '#FF6600' }}>{Object.keys(machineData)[0]}</span></p>
        </div>
      )}
      <div className="pt-1 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-1">Total:</p>
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-600 font-medium">&lt;84°C: {totalBelow84.toFixed(1)}h</span>
          <span className="text-amber-600 font-medium">84-96°C: {total84to96.toFixed(1)}h</span>
          <span className="text-red-600 font-medium">≥97°C: {total97Above.toFixed(1)}h</span>
        </div>
      </div>
    </div>
  );
}

// Tooltip para modo mensal - mostra breakdown por máquina dentro do mês
function TempMonthlyTooltip({ active, payload, label, rawData, selectedYear }: { active?: boolean; payload?: any[]; label?: string; rawData: TempRecord[]; selectedYear?: string }) {
  if (!active || !payload || !label) return null;
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthNum = monthNames.indexOf(label || '') + 1;
  
  // Filtrar dados do mês
  let recordsForMonth = rawData.filter(d => d.parsedDate.getMonth() + 1 === monthNum);
  
  // Se tiver filtro de ano específico, mostrar qual ano
  const yearLabel = selectedYear && selectedYear !== 'all' ? `/${selectedYear}` : '';
  
  const totalBelow84 = recordsForMonth.reduce((sum, r) => sum + r.tempBelow84, 0);
  const total84to96 = recordsForMonth.reduce((sum, r) => sum + r.temp84to96, 0);
  const total97Above = recordsForMonth.reduce((sum, r) => sum + r.temp97Above, 0);
  
  // Agrupar por máquina
  const machineData: Record<string, { below84: number; mid: number; above: number }> = {};
  recordsForMonth.forEach(r => {
    if (!machineData[r.machine]) machineData[r.machine] = { below84: 0, mid: 0, above: 0 };
    machineData[r.machine].below84 += r.tempBelow84;
    machineData[r.machine].mid += r.temp84to96;
    machineData[r.machine].above += r.temp97Above;
  });
  
  // Contar quantos anos têm dados
  const yearsWithData = [...new Set(recordsForMonth.map(r => r.parsedDate.getFullYear()))].sort();
  
  return (
    <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg max-w-xs">
      <p className="font-semibold text-slate-700 mb-2 border-b pb-1">{label}{yearLabel}</p>
      {yearsWithData.length > 1 && selectedYear === 'all' && (
        <p className="text-xs text-slate-400 mb-2">Anos: {yearsWithData.join(', ')}</p>
      )}
      {Object.keys(machineData).length > 1 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-500 mb-1">Por Máquina:</p>
          {Object.entries(machineData).map(([machine, data]) => (
            <div key={machine} className="text-xs mb-1">
              <span className="font-medium" style={{ color: MACHINE_COLORS[machine] || '#FF6600' }}>{machine}:</span>
              {' '}<span className="text-emerald-600">{data.below84.toFixed(1)}h</span>
              {' / '}<span className="text-amber-600">{data.mid.toFixed(1)}h</span>
              {' / '}<span className="text-red-600">{data.above.toFixed(1)}h</span>
            </div>
          ))}
        </div>
      )}
      {Object.keys(machineData).length === 1 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-500 mb-1">Máquina: <span style={{ color: MACHINE_COLORS[Object.keys(machineData)[0]] || '#FF6600' }}>{Object.keys(machineData)[0]}</span></p>
        </div>
      )}
      <div className="pt-1 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-1">Total do Mês:</p>
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-600 font-medium">&lt;84°C: {totalBelow84.toFixed(1)}h</span>
          <span className="text-amber-600 font-medium">84-96°C: {total84to96.toFixed(1)}h</span>
          <span className="text-red-600 font-medium">≥97°C: {total97Above.toFixed(1)}h</span>
        </div>
      </div>
    </div>
  );
}

function AlarmDateCustomTooltip({ active, payload, label, alarms }: { active?: boolean; payload?: any[]; label?: string; alarms: AlarmRecord[] }) {
  if (!active || !payload || !label) return null;
  
  const alarmsForDate = alarms.filter(a => a.date.toLocaleDateString('pt-BR') === label);
  const machineCount: Record<string, number> = {};
  alarmsForDate.forEach(a => {
    machineCount[a.machine] = (machineCount[a.machine] || 0) + 1;
  });
  
  const total = alarmsForDate.length;
  
  return (
    <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg max-w-xs">
      <p className="font-semibold text-slate-700 mb-2 border-b pb-1">{label}</p>
      {Object.keys(machineCount).length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-500 mb-1">Por Máquina:</p>
          {Object.entries(machineCount).sort((a, b) => b[1] - a[1]).map(([machine, count]) => (
            <div key={machine} className="text-xs mb-1 flex justify-between">
              <span className="font-medium" style={{ color: MACHINE_COLORS[machine] || '#FF6600' }}>{machine}</span>
              <span className="text-slate-600">{count}</span>
            </div>
          ))}
        </div>
      )}
      <div className="pt-1 border-t border-slate-100">
        <p className="text-sm font-medium" style={{ color: '#FF6600' }}>Total: {total} alarme{total !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

function AlarmMonthCustomTooltip({ active, payload, label, alarms, selectedYear }: { active?: boolean; payload?: any[]; label?: string; alarms: AlarmRecord[]; selectedYear: string }) {
  if (!active || !payload || !label) return null;
  
  const data = payload[0]?.payload;
  if (!data) return null;
  
  // Usar o monthKey do payload para filtrar os alarmes
  const monthKey = data.monthKey;
  
  const alarmsForMonth = alarms.filter(a => {
    const aMonthKey = `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`;
    return aMonthKey === monthKey;
  });
  
  const machineCount: Record<string, number> = {};
  alarmsForMonth.forEach(a => {
    machineCount[a.machine] = (machineCount[a.machine] || 0) + 1;
  });
  
  // Mostrar o label com ano se disponível
  const displayLabel = selectedYear !== 'all' ? `${label}/${selectedYear}` : label;
  
  return (
    <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg max-w-xs">
      <p className="font-semibold text-slate-700 mb-2 border-b pb-1">{displayLabel}</p>
      {Object.keys(machineCount).length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-500 mb-1">Por Máquina:</p>
          {Object.entries(machineCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([machine, count]) => (
            <div key={machine} className="text-xs mb-1 flex justify-between">
              <span className="font-medium" style={{ color: MACHINE_COLORS[machine] || '#FF6600' }}>{machine}</span>
              <span className="text-slate-600">{count}</span>
            </div>
          ))}
          {Object.keys(machineCount).length > 5 && (
            <p className="text-xs text-slate-400">+{Object.keys(machineCount).length - 5} máquinas</p>
          )}
        </div>
      )}
      <div className="pt-1 border-t border-slate-100">
        <div className="flex gap-4 text-xs">
          <span className="font-medium" style={{ color: '#FF6600' }}>No mês: {data.alarmes}</span>
          <span className="text-red-600 font-medium">Acumulado: {data.acumulado}</span>
        </div>
      </div>
    </div>
  );
}

// ==================== TEMPERATURE DASHBOARD ====================
function TemperatureDashboard({ 
  data, 
  onDataChange 
}: { 
  data: TempRecord[]; 
  onDataChange: (data: TempRecord[]) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activeMachines = useMemo(() => [...new Set(data.map(d => d.machine))].sort(), [data]);
  
  // Meses disponíveis (1-12) baseado nos dados
  const availableMonths = useMemo(() => {
    const months = new Set<number>();
    data.forEach(d => {
      months.add(d.parsedDate.getMonth() + 1); // 1-12
    });
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return Array.from(months).sort((a, b) => a - b).map(m => ({
      value: m.toString(),
      label: monthNames[m - 1]
    }));
  }, [data]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    data.forEach(d => years.add(d.parsedDate.getFullYear()));
    return Array.from(years).sort().map(y => ({ value: y.toString(), label: y.toString() }));
  }, [data]);

  const [periodFilter, setPeriodFilter] = useState('all');
  const [machineFilter, setMachineFilter] = useState('all');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedChartMonth, setSelectedChartMonth] = useState<string>('all');
  const [selectedChartYear, setSelectedChartYear] = useState<string>('all');
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>('all'); // Ano para modo mensal
  const [tableSearch, setTableSearch] = useState('');
  const [tableMachineFilter, setTableMachineFilter] = useState('all');
  const [tableMonthFilter, setTableMonthFilter] = useState('all');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');
  const [chartViewMode, setChartViewMode] = useState<'date' | 'month'>('date');
  
  // Estados para navegação ponto a ponto
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showNavigation, setShowNavigation] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  
  useEffect(() => {
    if (availableYears.length > 0 && selectedChartYear === 'all') {
      setSelectedChartYear(availableYears[availableYears.length - 1].value);
    }
    if (availableYears.length > 0 && selectedMonthYear === 'all') {
      setSelectedMonthYear(availableYears[availableYears.length - 1].value);
    }
  }, [availableYears, selectedChartYear, selectedMonthYear]);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowPasswordModal(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleImportConfirmed = async () => {
    if (!pendingFile) return;
    setIsLoading(true);
    try {
      const fileData = await pendingFile.arrayBuffer();
      const workbook = XLSX.read(fileData);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
      
      const parsedData: TempRecord[] = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length >= 5) {
          const machine = String(row[0] || '').trim();
          const dateValue = row[1];
          const tempBelow84 = parseNumber(row[2]);
          const temp84to96 = parseNumber(row[3]);
          const temp97Above = parseNumber(row[4]);
          
          if (machine && dateValue !== undefined && dateValue !== null) {
            const { date, dateStr } = parseTempDate(dateValue);
            parsedData.push({
              date,
              dateStr,
              machine,
              tempBelow84,
              temp84to96,
              temp97Above,
              parsedDate: date
            });
          }
        }
      }
      
      parsedData.sort((a, b) => a.date.getTime() - b.date.getTime());
      onDataChange(parsedData);
      setPendingFile(null);
      
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert('Erro ao importar arquivo! Verifique o formato.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearConfirmed = async () => {
    onDataChange([]);
    setShowClearModal(false);
  };
  
  const exportToExcel = () => {
    if (filteredData.length === 0) return;
    
    const exportData = tableFilteredData.map(d => ({
      'Máquina': d.machine,
      'Data': d.dateStr,
      '<84°C (horas)': d.tempBelow84,
      '84-96°C (horas)': d.temp84to96,
      '≥97°C (horas)': d.temp97Above
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Temperatura');
    XLSX.writeFile(wb, `temperatura_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (machineFilter !== 'all') {
      result = result.filter(d => d.machine === machineFilter);
    }
    if (useCustomDate && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(d => d.parsedDate >= start && d.parsedDate <= end);
    }
    if (periodFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      switch (periodFilter) {
        case '30d': filterDate.setDate(now.getDate() - 30); result = result.filter(d => d.parsedDate >= filterDate); break;
        case '90d': filterDate.setDate(now.getDate() - 90); result = result.filter(d => d.parsedDate >= filterDate); break;
        case '2023': result = result.filter(d => d.parsedDate.getFullYear() === 2023); break;
        case '2024': result = result.filter(d => d.parsedDate.getFullYear() === 2024); break;
        case '2025': result = result.filter(d => d.parsedDate.getFullYear() === 2025); break;
        case '2026': result = result.filter(d => d.parsedDate.getFullYear() === 2026); break;
      }
    }
    return result;
  }, [data, periodFilter, useCustomDate, startDate, endDate, machineFilter]);

  const stats = useMemo(() => {
    const totalRecords = filteredData.length;
    if (totalRecords === 0) return null;
    const avgBelow84 = filteredData.reduce((sum, d) => sum + d.tempBelow84, 0) / totalRecords;
    const avg84to96 = filteredData.reduce((sum, d) => sum + d.temp84to96, 0) / totalRecords;
    const avg97Above = filteredData.reduce((sum, d) => sum + d.temp97Above, 0) / totalRecords;
    const totalBelow84 = filteredData.reduce((sum, d) => sum + d.tempBelow84, 0);
    const total84to96 = filteredData.reduce((sum, d) => sum + d.temp84to96, 0);
    const total97Above = filteredData.reduce((sum, d) => sum + d.temp97Above, 0);
    const daysWithHighTemp = filteredData.filter(d => d.temp97Above > 0).length;
    return { totalRecords, avgBelow84, avg84to96, avg97Above, totalBelow84, total84to96, total97Above, daysWithHighTemp, highTempPercentage: (daysWithHighTemp / totalRecords) * 100 };
  }, [filteredData]);

  const pieData = useMemo(() => {
    if (!stats) return [];
    const total = stats.totalBelow84 + stats.total84to96 + stats.total97Above;
    return [
      { name: '<84°C', value: stats.totalBelow84, color: PIE_COLORS[0], totalValue: total },
      { name: '84-96°C', value: stats.total84to96, color: PIE_COLORS[1], totalValue: total },
      { name: '≥97°C', value: stats.total97Above, color: PIE_COLORS[2], totalValue: total }
    ];
  }, [stats]);

  // Dados brutos para o tooltip (com breakdown por máquina)
  const rawChartData = useMemo(() => {
    let result = filteredData;
    if (selectedChartYear !== 'all') {
      result = result.filter(d => d.parsedDate.getFullYear() === parseInt(selectedChartYear));
    }
    if (selectedChartMonth !== 'all') {
      result = result.filter(d => d.parsedDate.getMonth() + 1 === parseInt(selectedChartMonth));
    }
    return result;
  }, [filteredData, selectedChartMonth, selectedChartYear]);

  // Dados agrupados por data (somando todas as máquinas)
  const chartData = useMemo(() => {
    const grouped: Record<string, {
      displayDate: string;
      date: Date;
      tempBelow84: number;
      temp84to96: number;
      temp97Above: number;
      machines: string[];
    }> = {};

    rawChartData.forEach(d => {
      const key = d.dateStr;
      if (!grouped[key]) {
        grouped[key] = {
          displayDate: d.dateStr,
          date: d.date,
          tempBelow84: 0,
          temp84to96: 0,
          temp97Above: 0,
          machines: []
        };
      }
      grouped[key].tempBelow84 += d.tempBelow84;
      grouped[key].temp84to96 += d.temp84to96;
      grouped[key].temp97Above += d.temp97Above;
      if (!grouped[key].machines.includes(d.machine)) {
        grouped[key].machines.push(d.machine);
      }
    });

    // Ordenar por data
    return Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [rawChartData]);

  // Dados agrupados por mês (para modo mensal) - com filtro de ano
  const monthlyChartData = useMemo(() => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    // Filtrar por ano se selecionado
    let dataToUse = filteredData;
    if (selectedMonthYear !== 'all') {
      dataToUse = filteredData.filter(d => d.parsedDate.getFullYear() === parseInt(selectedMonthYear));
    }
    
    // Agrupar por mês (1-12)
    const grouped: Record<number, {
      month: string;
      monthNum: number;
      tempBelow84: number;
      temp84to96: number;
      temp97Above: number;
      machines: string[];
    }> = {};
    
    // Inicializar todos os meses
    for (let i = 1; i <= 12; i++) {
      grouped[i] = {
        month: monthNames[i - 1],
        monthNum: i,
        tempBelow84: 0,
        temp84to96: 0,
        temp97Above: 0,
        machines: []
      };
    }
    
    // Somar dados por mês
    dataToUse.forEach(d => {
      const monthNum = d.parsedDate.getMonth() + 1;
      grouped[monthNum].tempBelow84 += d.tempBelow84;
      grouped[monthNum].temp84to96 += d.temp84to96;
      grouped[monthNum].temp97Above += d.temp97Above;
      if (!grouped[monthNum].machines.includes(d.machine)) {
        grouped[monthNum].machines.push(d.machine);
      }
    });
    
    return Object.values(grouped).sort((a, b) => a.monthNum - b.monthNum);
  }, [filteredData, selectedMonthYear]);

  // Dados brutos para tooltip mensal (para breakdown por máquina)
  const monthlyRawData = useMemo(() => {
    if (selectedMonthYear !== 'all') {
      return filteredData.filter(d => d.parsedDate.getFullYear() === parseInt(selectedMonthYear));
    }
    return filteredData;
  }, [filteredData, selectedMonthYear]);

  // Funções de navegação ponto a ponto
  const handlePrevPoint = () => {
    const data = chartViewMode === 'date' ? chartData : monthlyChartData;
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    } else if (selectedIndex === -1 && data.length > 0) {
      setSelectedIndex(data.length - 1);
    }
  };

  const handleNextPoint = () => {
    const data = chartViewMode === 'date' ? chartData : monthlyChartData;
    if (selectedIndex < data.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (selectedIndex === -1 && data.length > 0) {
      setSelectedIndex(0);
    }
  };

  const handleSearchDate = () => {
    if (!searchDate) return;
    const data = chartViewMode === 'date' ? chartData : monthlyChartData;
    
    if (chartViewMode === 'date') {
      // Buscar por data específica
      const index = data.findIndex((d: any) => d.displayDate === searchDate || d.dateStr === searchDate);
      if (index !== -1) {
        setSelectedIndex(index);
        setShowNavigation(true);
      } else {
        // Tentar buscar por data no formato DD/MM/AAAA
        const foundIndex = data.findIndex((d: any) => {
          const dateStr = d.displayDate || d.dateStr || '';
          return dateStr.includes(searchDate) || searchDate.includes(dateStr);
        });
        if (foundIndex !== -1) {
          setSelectedIndex(foundIndex);
          setShowNavigation(true);
        }
      }
    } else {
      // Buscar por mês no modo mensal
      const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const searchLower = searchDate.toLowerCase();
      const monthIndex = monthNames.findIndex(m => m.includes(searchLower) || searchLower.includes(m));
      if (monthIndex !== -1) {
        setSelectedIndex(monthIndex);
        setShowNavigation(true);
      }
    }
  };

  const top5HighTemp = useMemo(() => {
    return [...filteredData].sort((a, b) => b.temp97Above - a.temp97Above).slice(0, 5);
  }, [filteredData]);

  const tableFilteredData = useMemo(() => {
    let result = filteredData;
    if (tableSearch) {
      const searchLower = tableSearch.toLowerCase();
      result = result.filter(d => d.dateStr.toLowerCase().includes(searchLower) || d.machine.toLowerCase().includes(searchLower));
    }
    if (tableMachineFilter !== 'all') {
      result = result.filter(d => d.machine === tableMachineFilter);
    }
    if (tableMonthFilter !== 'all') {
      result = result.filter(d => {
        const monthKey = `${d.parsedDate.getFullYear()}-${String(d.parsedDate.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === tableMonthFilter;
      });
    }
    if (tableStatusFilter !== 'all') {
      if (tableStatusFilter === 'alerta') {
        result = result.filter(d => d.temp97Above > 0);
      } else if (tableStatusFilter === 'normal') {
        result = result.filter(d => d.temp97Above === 0);
      }
    }
    return result;
  }, [filteredData, tableSearch, tableMachineFilter, tableMonthFilter, tableStatusFilter]);

  return (
    <div className="space-y-4">
      <PasswordModal
        open={showPasswordModal}
        onOpenChange={(open) => { setShowPasswordModal(open); if (!open) setPendingFile(null); }}
        onConfirm={handleImportConfirmed}
        title="Confirmar Importação"
        description="Digite a senha de administrador para importar os dados."
      />
      
      <PasswordModal
        open={showClearModal}
        onOpenChange={setShowClearModal}
        onConfirm={handleClearConfirmed}
        title="Confirmar Exclusão"
        description="Digite a senha de administrador para excluir todos os dados."
      />

      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5" style={{ color: '#FF6600' }} />
            Importar Dados de Temperatura
          </CardTitle>
          <CardDescription>
            Colunas: Machine, Date, &lt;84°C, 84-96°C, ≥97°C [Hours]
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" id="temp-file-upload" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="gap-2 text-white" style={{ backgroundColor: '#FF6600' }}>
              {isLoading ? <><Activity className="h-4 w-4 animate-spin" />Importando...</> : <><Lock className="h-4 w-4" />Importar Excel</>}
            </Button>
            {data.length > 0 && (
              <>
                <Badge className="text-sm py-1 px-3" style={{ backgroundColor: '#FFF0E6', color: '#FF6600' }}>{data.length} registros</Badge>
                <Button variant="outline" size="sm" onClick={() => setShowClearModal(true)} className="text-red-600 hover:text-red-700 gap-1">
                  <Lock className="h-4 w-4" />Excluir Dados
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {data.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum dado de temperatura</h3>
            <p className="text-slate-500">Importe uma planilha Excel para visualizar os dados.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardHeader className="pb-2"><CardDescription className="text-emerald-100">Total &lt;84°C</CardDescription><CardTitle className="text-3xl">{stats!.totalBelow84.toFixed(1)}h</CardTitle></CardHeader>
              <CardContent><span className="text-sm text-emerald-100">Média: {stats!.avgBelow84.toFixed(1)}h/dia</span></CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <CardHeader className="pb-2"><CardDescription className="text-amber-100">Total 84-96°C</CardDescription><CardTitle className="text-3xl">{stats!.total84to96.toFixed(1)}h</CardTitle></CardHeader>
              <CardContent><span className="text-sm text-amber-100">Média: {stats!.avg84to96.toFixed(1)}h/dia</span></CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
              <CardHeader className="pb-2"><CardDescription className="text-red-100">Total ≥97°C</CardDescription><CardTitle className="text-3xl">{stats!.total97Above.toFixed(1)}h</CardTitle></CardHeader>
              <CardContent><span className="text-sm text-red-100">Média: {stats!.avg97Above.toFixed(2)}h/dia</span></CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardHeader className="pb-2"><CardDescription className="text-indigo-100">Dias c/ Alta Temp</CardDescription><CardTitle className="text-3xl">{stats!.daysWithHighTemp}</CardTitle></CardHeader>
              <CardContent><span className="text-sm text-indigo-100">{stats!.highTempPercentage.toFixed(1)}%</span></CardContent>
            </Card>
          </div>

          {/* Top 5 */}
          {top5HighTemp.length > 0 && top5HighTemp[0].temp97Above > 0 && (
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5" style={{ color: '#FF6600' }} />
                  Top 5 Maiores Temperaturas (≥97°C)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {top5HighTemp.filter(d => d.temp97Above > 0).map((d, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${i === 0 ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white' : i === 1 ? 'bg-gradient-to-r from-orange-400 to-orange-300 text-white' : i === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-200 text-slate-700' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-8 ${i < 3 ? '' : 'text-slate-500'}`}>{i + 1}º</span>
                        <span className={i < 3 ? '' : 'text-slate-600'}>{d.dateStr}</span>
                        <Badge variant="outline" className={i < 3 ? 'border-white/50 text-white' : ''} style={{ color: i < 3 ? 'white' : '#FF6600' }}>{d.machine}</Badge>
                      </div>
                      <span className={`font-bold ${i < 3 ? '' : 'text-red-600'}`}>{d.temp97Above.toFixed(1)}h</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <LineChartIcon className="h-5 w-5" style={{ color: '#FF6600' }} />
                        Tendência de Temperatura
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Botão de alternância de modo */}
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                        <Button
                          size="sm"
                          variant={chartViewMode === 'date' ? 'default' : 'ghost'}
                          onClick={() => { setChartViewMode('date'); setSelectedIndex(-1); }}
                          className={`text-xs h-7 px-3 ${chartViewMode === 'date' ? 'text-white' : 'text-slate-600'}`}
                          style={chartViewMode === 'date' ? { backgroundColor: '#FF6600' } : {}}
                        >
                          Por Data
                        </Button>
                        <Button
                          size="sm"
                          variant={chartViewMode === 'month' ? 'default' : 'ghost'}
                          onClick={() => { setChartViewMode('month'); setSelectedIndex(-1); }}
                          className={`text-xs h-7 px-3 ${chartViewMode === 'month' ? 'text-white' : 'text-slate-600'}`}
                          style={chartViewMode === 'month' ? { backgroundColor: '#FF6600' } : {}}
                        >
                          Por Mês
                        </Button>
                      </div>
                      {/* Filtros de Ano e Mês no modo "Por Data" */}
                      {chartViewMode === 'date' && (
                        <>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">Ano:</span>
                            <Select value={selectedChartYear} onValueChange={(v) => { setSelectedChartYear(v); setSelectedIndex(-1); }}>
                              <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {availableYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">Mês:</span>
                            <Select value={selectedChartMonth} onValueChange={(v) => { setSelectedChartMonth(v); setSelectedIndex(-1); }}>
                              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {availableMonths.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      {/* Filtro de Ano no modo "Por Mês" */}
                      {chartViewMode === 'month' && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">Ano:</span>
                          <Select value={selectedMonthYear} onValueChange={(v) => { setSelectedMonthYear(v); setSelectedIndex(-1); }}>
                            <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              {availableYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Barra de navegação ponto a ponto */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNavigation(!showNavigation)}
                      className={`gap-1 h-7 ${showNavigation ? 'bg-slate-100' : ''}`}
                    >
                      <Navigation className="h-3 w-3" />
                      Navegar
                    </Button>
                    
                    {showNavigation && (
                      <>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePrevPoint}
                            disabled={chartViewMode === 'date' ? chartData.length === 0 : monthlyChartData.length === 0}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleNextPoint}
                            disabled={chartViewMode === 'date' ? chartData.length === 0 : monthlyChartData.length === 0}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Input
                            placeholder={chartViewMode === 'date' ? 'DD/MM/AAAA' : 'Mês...'}
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchDate()}
                            className="w-[120px] h-7 text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSearchDate}
                            className="h-7 w-7 p-0"
                          >
                            <Search className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {selectedIndex >= 0 && (
                          <Badge className="bg-slate-100 text-slate-700 text-xs">
                            {chartViewMode === 'date' 
                              ? `${selectedIndex + 1} de ${chartData.length}`
                              : `${selectedIndex + 1} de ${monthlyChartData.length}`
                            }
                          </Badge>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setSelectedIndex(-1); setSearchDate(''); }}
                          className="h-7 text-xs text-slate-500"
                        >
                          Limpar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Info do ponto selecionado com breakdown por máquina */}
                {showNavigation && selectedIndex >= 0 && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg border">
                    {chartViewMode === 'date' && chartData[selectedIndex] && (
                      <>
                        <p className="font-semibold text-slate-700 mb-2">
                          📅 {chartData[selectedIndex].displayDate}
                          {chartData[selectedIndex].machines?.length > 1 && (
                            <span className="text-xs text-slate-500 ml-2">
                              ({chartData[selectedIndex].machines.length} máquinas)
                            </span>
                          )}
                        </p>
                        
                        {/* Breakdown por máquina */}
                        {chartViewMode === 'date' && (() => {
                          const selectedDate = chartData[selectedIndex].displayDate;
                          const machineData: Record<string, { below84: number; mid: number; above: number }> = {};
                          rawChartData.filter(d => d.dateStr === selectedDate).forEach(r => {
                            if (!machineData[r.machine]) machineData[r.machine] = { below84: 0, mid: 0, above: 0 };
                            machineData[r.machine].below84 += r.tempBelow84;
                            machineData[r.machine].mid += r.temp84to96;
                            machineData[r.machine].above += r.temp97Above;
                          });
                          
                          return Object.keys(machineData).length > 1 && (
                            <div className="mb-2 p-2 bg-white rounded border">
                              <p className="text-xs font-medium text-slate-500 mb-1">Por Máquina:</p>
                              {Object.entries(machineData).map(([machine, data]) => (
                                <div key={machine} className="text-xs mb-1 flex items-center gap-2">
                                  <span className="font-medium w-16" style={{ color: MACHINE_COLORS[machine] || '#FF6600' }}>{machine}</span>
                                  <span className="text-emerald-600">{data.below84.toFixed(1)}h</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-amber-600">{data.mid.toFixed(1)}h</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-red-600">{data.above.toFixed(1)}h</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        
                        <div className="flex gap-4 text-sm">
                          <span className="text-emerald-600 font-medium">&lt;84°C: {chartData[selectedIndex].tempBelow84.toFixed(1)}h</span>
                          <span className="text-amber-600 font-medium">84-96°C: {chartData[selectedIndex].temp84to96.toFixed(1)}h</span>
                          <span className="text-red-600 font-medium">≥97°C: {chartData[selectedIndex].temp97Above.toFixed(1)}h</span>
                        </div>
                      </>
                    )}
                    {chartViewMode === 'month' && monthlyChartData[selectedIndex] && (
                      <>
                        <p className="font-semibold text-slate-700 mb-2">
                          📅 {monthlyChartData[selectedIndex].month}
                          {selectedMonthYear !== 'all' && <span className="text-xs text-slate-500 ml-1">/{selectedMonthYear}</span>}
                          {monthlyChartData[selectedIndex].machines?.length > 1 && (
                            <span className="text-xs text-slate-500 ml-2">
                              ({monthlyChartData[selectedIndex].machines.length} máquinas)
                            </span>
                          )}
                        </p>
                        
                        {/* Breakdown por máquina */}
                        {(() => {
                          const monthNum = monthlyChartData[selectedIndex].monthNum;
                          const machineData: Record<string, { below84: number; mid: number; above: number }> = {};
                          monthlyRawData.filter(d => d.parsedDate.getMonth() + 1 === monthNum).forEach(r => {
                            if (!machineData[r.machine]) machineData[r.machine] = { below84: 0, mid: 0, above: 0 };
                            machineData[r.machine].below84 += r.tempBelow84;
                            machineData[r.machine].mid += r.temp84to96;
                            machineData[r.machine].above += r.temp97Above;
                          });
                          
                          return Object.keys(machineData).length > 1 && (
                            <div className="mb-2 p-2 bg-white rounded border">
                              <p className="text-xs font-medium text-slate-500 mb-1">Por Máquina:</p>
                              {Object.entries(machineData).map(([machine, data]) => (
                                <div key={machine} className="text-xs mb-1 flex items-center gap-2">
                                  <span className="font-medium w-16" style={{ color: MACHINE_COLORS[machine] || '#FF6600' }}>{machine}</span>
                                  <span className="text-emerald-600">{data.below84.toFixed(1)}h</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-amber-600">{data.mid.toFixed(1)}h</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="text-red-600">{data.above.toFixed(1)}h</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        
                        <div className="flex gap-4 text-sm">
                          <span className="text-emerald-600 font-medium">&lt;84°C: {monthlyChartData[selectedIndex].tempBelow84.toFixed(1)}h</span>
                          <span className="text-amber-600 font-medium">84-96°C: {monthlyChartData[selectedIndex].temp84to96.toFixed(1)}h</span>
                          <span className="text-red-600 font-medium">≥97°C: {monthlyChartData[selectedIndex].temp97Above.toFixed(1)}h</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <div className="h-[300px]">
                  {chartViewMode === 'date' && chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400"><p>Selecione filtros para ver os dados</p></div>
                  ) : chartViewMode === 'date' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<TempTrendCustomTooltip rawData={rawChartData} />} />
                        <Legend />
                        <Area type="monotone" dataKey="tempBelow84" name="<84°C" stackId="1" stroke={COLORS.below84} fill={COLORS.below84} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="temp84to96" name="84-96°C" stackId="1" stroke={COLORS.range84to96} fill={COLORS.range84to96} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="temp97Above" name="≥97°C" stackId="1" stroke={COLORS.above97} fill={COLORS.above97} fillOpacity={0.6} />
                        {/* Linha indicadora de posição */}
                        {showNavigation && selectedIndex >= 0 && chartData[selectedIndex] && (
                          <ReferenceLine 
                            x={chartData[selectedIndex].displayDate} 
                            stroke="#FF6600" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<TempMonthlyTooltip rawData={monthlyRawData} selectedYear={selectedMonthYear} />} />
                        <Legend />
                        <Area type="monotone" dataKey="tempBelow84" name="<84°C" stackId="1" stroke={COLORS.below84} fill={COLORS.below84} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="temp84to96" name="84-96°C" stackId="1" stroke={COLORS.range84to96} fill={COLORS.range84to96} fillOpacity={0.6} />
                        <Area type="monotone" dataKey="temp97Above" name="≥97°C" stackId="1" stroke={COLORS.above97} fill={COLORS.above97} fillOpacity={0.6} />
                        {/* Linha indicadora de posição */}
                        {showNavigation && selectedIndex >= 0 && monthlyChartData[selectedIndex] && (
                          <ReferenceLine 
                            x={monthlyChartData[selectedIndex].month} 
                            stroke="#FF6600" 
                            strokeWidth={2}
                            strokeDasharray="5 5"
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChartIcon className="h-5 w-5" style={{ color: '#FF6600' }} />
                  Distribuição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5" style={{ color: '#FF6600' }} />
                    Dados Detalhados
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tableFilteredData.length} de {filteredData.length}</Badge>
                    <Button variant="outline" size="sm" onClick={exportToExcel} disabled={tableFilteredData.length === 0} className="gap-1">
                      <Download className="h-4 w-4" />Exportar
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                  <Input placeholder="Buscar..." value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} className="max-w-[150px]" />
                  <Select value={tableMachineFilter} onValueChange={setTableMachineFilter}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {activeMachines.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={tableMonthFilter} onValueChange={setTableMonthFilter}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {availableMonths.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={tableStatusFilter} onValueChange={setTableStatusFilter}>
                    <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alerta">Alerta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px] border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold">Máquina</TableHead>
                      <TableHead className="font-semibold text-right">&lt;84°C</TableHead>
                      <TableHead className="font-semibold text-right">84-96°C</TableHead>
                      <TableHead className="font-semibold text-right">≥97°C</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableFilteredData.slice().reverse().map((row, i) => (
                      <TableRow key={i} className={row.temp97Above > 0 ? 'bg-red-50' : ''}>
                        <TableCell>{row.dateStr}</TableCell>
                        <TableCell><Badge variant="outline" style={{ color: '#FF6600' }}>{row.machine}</Badge></TableCell>
                        <TableCell className="text-right">{row.tempBelow84.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{row.temp84to96.toFixed(1)}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">{row.temp97Above.toFixed(1)}</TableCell>
                        <TableCell>{row.temp97Above > 0 ? <Badge variant="destructive">Alerta</Badge> : <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Normal</Badge>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ==================== ALARMS DASHBOARD ====================
function AlarmsDashboard({ 
  data, 
  onDataChange 
}: { 
  data: AlarmRecord[]; 
  onDataChange: (data: AlarmRecord[]) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activeMachines = useMemo(() => [...new Set(data.map(a => a.machine))].sort(), [data]);
  
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    data.forEach(a => {
      const monthKey = `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return Array.from(months).sort().map(m => {
      const monthNum = parseInt(m.split('-')[1]);
      return {
        value: m,
        label: monthNames[monthNum - 1]
      };
    });
  }, [data]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    data.forEach(a => years.add(a.date.getFullYear()));
    return Array.from(years).sort().map(y => ({ value: y.toString(), label: y.toString() }));
  }, [data]);

  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedYearAccum, setSelectedYearAccum] = useState<string>('all');
  const [rankingMachineFilter, setRankingMachineFilter] = useState('all');
  const [rankingMonthFilter, setRankingMonthFilter] = useState('all');
  const [rankingYearFilter, setRankingYearFilter] = useState('all');
  
  useEffect(() => {
    if (availableMonths.length > 0 && selectedMonth === 'all') {
      setSelectedMonth(availableMonths[availableMonths.length - 1].value);
    }
  }, [availableMonths, selectedMonth]);

  useEffect(() => {
    if (availableYears.length > 0 && selectedYear === 'all') {
      setSelectedYear(availableYears[availableYears.length - 1].value);
    }
    if (availableYears.length > 0 && selectedYearAccum === 'all') {
      setSelectedYearAccum(availableYears[availableYears.length - 1].value);
    }
  }, [availableYears, selectedYear, selectedYearAccum]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowPasswordModal(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportConfirmed = async () => {
    if (!pendingFile) return;
    setIsLoading(true);
    try {
      const fileData = await pendingFile.arrayBuffer();
      const workbook = XLSX.read(fileData);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
      
      console.log('=== DEBUG IMPORT ALARMS ===');
      console.log('Total rows:', jsonData.length);
      for (let i = 0; i < Math.min(5, jsonData.length); i++) {
        console.log(`Row ${i}:`, JSON.stringify(jsonData[i]));
      }
      
      // Detect column positions from header
      const header = jsonData[0] as string[];
      let dateColIndex = -1;
      let codeColIndex = -1;
      let nameColIndex = -1;
      let machineColIndex = -1;
      
      header?.forEach((h, i) => {
        const hStr = String(h || '').trim();
        const hLower = hStr.toLowerCase();
        console.log(`Coluna ${i}: "${hStr}" -> "${hLower}"`);
        
        // Machine column - detectar primeiro (mais específico)
        if (hLower === 'machine' || hLower === 'máquina' || hLower === 'equipamento') {
          machineColIndex = i;
        }
        // Date column
        else if (hLower === 'date' || hLower === 'data' || hLower.includes('data/hora') || hLower === 'time') {
          dateColIndex = i;
        }
        // Code column - Fault/Alarm Code
        else if (hLower.includes('fault') || hLower.includes('alarm code') || hLower === 'code' || hLower === 'código' || hLower === 'codigo') {
          codeColIndex = i;
        }
        // Name column
        else if (hLower === 'name' || hLower === 'nome' || hLower.includes('alarm name') || hLower.includes('description') || hLower.includes('descrição')) {
          nameColIndex = i;
        }
      });
      
      console.log('Colunas detectadas:', { machineColIndex, dateColIndex, codeColIndex, nameColIndex });
      
      // Fallback baseado na posição se não detectou todas
      // Formato padrão: Machine | Date | Fault/Alarm Code | Name
      if (header && header.length >= 4) {
        if (machineColIndex === -1) machineColIndex = 0;
        if (dateColIndex === -1) dateColIndex = 1;
        if (codeColIndex === -1) codeColIndex = 2;
        if (nameColIndex === -1) nameColIndex = 3;
      } else if (header && header.length >= 3) {
        // Formato sem Machine: Date | Code | Name
        if (dateColIndex === -1) dateColIndex = 0;
        if (codeColIndex === -1) codeColIndex = 1;
        if (nameColIndex === -1) nameColIndex = 2;
        machineColIndex = -1; // Não tem coluna machine
      }
      
      console.log('Colunas finais:', { machineColIndex, dateColIndex, codeColIndex, nameColIndex });
      
      const parsedAlarms: AlarmRecord[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length < 2) continue;
        
        const machine = machineColIndex >= 0 && row[machineColIndex] 
          ? String(row[machineColIndex]).trim() 
          : 'Máquina 1';
        const dateValue = row[dateColIndex];
        const code = String(row[codeColIndex] || '').trim();
        const name = String(row[nameColIndex] || '').trim();
        
        console.log(`Row ${i}:`, { machine, dateValue, code, name });
        
        // Validar dados - precisa ter pelo menos código E nome válidos
        // Código válido: não vazio e não é apenas número decimal
        const isValidCode = code && code.length > 0 && !code.match(/^-?\d+\.?\d*$/);
        // Nome válido: não vazio e tem mais de 2 caracteres
        const isValidName = name && name.length > 2;
        // Data válida: existe e não é string vazia
        const hasDate = dateValue !== undefined && dateValue !== null && dateValue !== '';
        
        if (!isValidCode || !isValidName || !hasDate) {
          console.log(`Row ${i} SKIPPED - isValidCode: ${isValidCode}, isValidName: ${isValidName}, hasDate: ${hasDate}`);
          continue;
        }
        
        const { date, dateStr } = parseExcelDate(dateValue);
        console.log(`Row ${i} PARSED:`, { dateStr, code, name, machine });
        
        parsedAlarms.push({ date, dateStr, code, name, machine: machine || 'Máquina 1' });
      }
      
      console.log('=== RESULTADO: ' + parsedAlarms.length + ' alarmes ===');
      
      parsedAlarms.sort((a, b) => b.date.getTime() - a.date.getTime());
      onDataChange(parsedAlarms);
      setPendingFile(null);
      
      if (parsedAlarms.length === 0) {
        alert('Nenhum alarme válido encontrado! Verifique o formato.\n\nEsperado: Machine | Date | Fault/Alarm Code | Name');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao importar arquivo! Verifique o formato.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConfirmed = async () => {
    onDataChange([]);
    setShowClearModal(false);
  };

  const filteredAlarms = useMemo(() => {
    return data.filter(a => {
      const matchSearch = !searchTerm || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [data, searchTerm]);

  const alarmsByDate = useMemo(() => {
    let result = filteredAlarms;
    if (selectedYear !== 'all') {
      result = result.filter(a => a.date.getFullYear() === parseInt(selectedYear));
    }
    if (selectedMonth !== 'all') {
      result = result.filter(a => {
        const monthKey = `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });
    }
    const dateCount: Record<string, number> = {};
    result.forEach(a => {
      const dateKey = a.date.toLocaleDateString('pt-BR');
      dateCount[dateKey] = (dateCount[dateKey] || 0) + 1;
    });
    return Object.entries(dateCount)
      .map(([date, count]) => ({ date, alarmes: count }))
      .sort((a, b) => {
        const [da, ma, ya] = a.date.split('/').map(Number);
        const [db, mb, yb] = b.date.split('/').map(Number);
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      });
  }, [filteredAlarms, selectedMonth, selectedYear]);

  const alarmsByMonth = useMemo(() => {
    let result = filteredAlarms;
    if (selectedYearAccum !== 'all') {
      result = result.filter(a => a.date.getFullYear() === parseInt(selectedYearAccum));
    }
    
    const monthCount: Record<string, number> = {};
    result.forEach(a => {
      const monthKey = `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`;
      monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
    });
    
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Se um ano específico está selecionado, mostrar todos os meses daquele ano
    if (selectedYearAccum !== 'all') {
      const year = parseInt(selectedYearAccum);
      let acumulado = 0;
      const data: { monthKey: string; month: string; alarmes: number; acumulado: number }[] = [];
      
      for (let m = 1; m <= 12; m++) {
        const monthKey = `${year}-${String(m).padStart(2, '0')}`;
        const count = monthCount[monthKey] || 0;
        if (count > 0) { // Só mostra meses com dados
          acumulado += count;
          data.push({
            monthKey,
            month: monthNames[m - 1],
            alarmes: count,
            acumulado
          });
        }
      }
      return data;
    }
    
    // Se "Todos" os anos estão selecionados, mostrar como antes
    const sorted = Object.entries(monthCount).sort((a, b) => a[0].localeCompare(b[0]));
    let acumulado = 0;
    return sorted.map(([month, count]) => {
      acumulado += count;
      const date = new Date(month + '-01');
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return { monthKey: month, month: `${monthName}/${String(year).slice(-2)}`, alarmes: count, acumulado };
    });
  }, [filteredAlarms, selectedYearAccum]);

  const alarmsForTooltips = useMemo(() => {
    let result = filteredAlarms;
    if (selectedYear !== 'all') {
      result = result.filter(a => a.date.getFullYear() === parseInt(selectedYear));
    }
    if (selectedMonth !== 'all') {
      result = result.filter(a => {
        const monthKey = `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });
    }
    return result;
  }, [filteredAlarms, selectedMonth, selectedYear]);

  const alarmsForTooltipsAccum = useMemo(() => {
    let result = filteredAlarms;
    if (selectedYearAccum !== 'all') {
      result = result.filter(a => a.date.getFullYear() === parseInt(selectedYearAccum));
    }
    return result;
  }, [filteredAlarms, selectedYearAccum]);

  // Ranking de falhas
  const failureRanking = useMemo(() => {
    let result = data;
    if (rankingMachineFilter !== 'all') {
      result = result.filter(a => a.machine === rankingMachineFilter);
    }
    if (rankingYearFilter !== 'all') {
      result = result.filter(a => a.date.getFullYear() === parseInt(rankingYearFilter));
    }
    if (rankingMonthFilter !== 'all') {
      result = result.filter(a => {
        const monthKey = `${a.date.getFullYear()}-${String(a.date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === rankingMonthFilter;
      });
    }
    
    const countMap: Record<string, { code: string; name: string; count: number }> = {};
    result.forEach(a => {
      const key = a.code;
      if (!countMap[key]) {
        countMap[key] = { code: a.code, name: a.name, count: 0 };
      }
      countMap[key].count++;
    });
    
    return Object.values(countMap).sort((a, b) => b.count - a.count);
  }, [data, rankingMachineFilter, rankingMonthFilter, rankingYearFilter]);

  const exportToExcel = () => {
    if (filteredAlarms.length === 0) return;
    const exportData = filteredAlarms.map(a => ({ 'Data/Hora': a.dateStr, 'Código': a.code, 'Nome do Alarme': a.name, 'Máquina': a.machine }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alarmes');
    XLSX.writeFile(wb, `alarmes_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <PasswordModal
        open={showPasswordModal}
        onOpenChange={(open) => { setShowPasswordModal(open); if (!open) setPendingFile(null); }}
        onConfirm={handleImportConfirmed}
        title="Confirmar Importação"
        description="Digite a senha de administrador para importar os dados."
      />
      
      <PasswordModal
        open={showClearModal}
        onOpenChange={setShowClearModal}
        onConfirm={handleClearConfirmed}
        title="Confirmar Exclusão"
        description="Digite a senha de administrador para excluir todos os dados."
      />

      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5" style={{ color: '#FF6600' }} />
            Importar Dados de Alarmes
          </CardTitle>
          <CardDescription>Colunas: Machine (opcional), Date, Fault/Alarm Code, Name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" id="file-upload" />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="gap-2 text-white" style={{ backgroundColor: '#FF6600' }}>
              {isLoading ? <><Activity className="h-4 w-4 animate-spin" />Importando...</> : <><Lock className="h-4 w-4" />Importar Excel</>}
            </Button>
            {data.length > 0 && (
              <>
                <Badge className="text-sm py-1 px-3" style={{ backgroundColor: '#FFF0E6', color: '#FF6600' }}>{data.length} alarmes</Badge>
                <Button variant="outline" size="sm" onClick={() => setShowClearModal(true)} className="text-red-600 hover:text-red-700 gap-1">
                  <Lock className="h-4 w-4" />Excluir Dados
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {data.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum dado de alarme</h3>
            <p className="text-slate-500">Importe uma planilha Excel para visualizar os alarmes.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500">Total de Alarmes</CardDescription>
                <CardTitle className="text-4xl">{data.length}</CardTitle>
              </CardHeader>
              <CardContent><span className="text-sm text-slate-500">Todos os registros importados</span></CardContent>
            </Card>
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-500">Máquinas</CardDescription>
                <CardTitle className="text-2xl">{activeMachines.length}</CardTitle>
              </CardHeader>
              <CardContent><span className="text-sm text-slate-500">{activeMachines.join(', ')}</span></CardContent>
            </Card>
          </div>

          {/* Ranking de Falhas */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5" style={{ color: '#FF6600' }} />
                  Ranking de Falhas ({failureRanking.length} tipos)
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">Máquina:</span>
                    <Select value={rankingMachineFilter} onValueChange={setRankingMachineFilter}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {activeMachines.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">Ano:</span>
                    <Select value={rankingYearFilter} onValueChange={setRankingYearFilter}>
                      <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {availableYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">Mês:</span>
                    <Select value={rankingMonthFilter} onValueChange={setRankingMonthFilter}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {availableMonths.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <div className="space-y-2">
                  {failureRanking.map((item, i) => (
                    <div key={item.code} className={`flex items-center justify-between p-2 rounded-lg ${i === 0 ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white' : i === 1 ? 'bg-gradient-to-r from-orange-400 to-orange-300 text-white' : i === 2 ? 'bg-gradient-to-r from-orange-300 to-orange-200 text-slate-700' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold w-8 ${i < 3 ? '' : 'text-slate-500'}`}>{i + 1}º</span>
                        <div>
                          <Badge variant="outline" className={`font-mono text-xs ${i < 3 ? 'border-white/50' : ''}`} style={{ color: i < 3 ? 'white' : '#FF6600' }}>{item.code}</Badge>
                          <span className={`ml-2 text-sm ${i < 3 ? '' : 'text-slate-600'}`}>{item.name}</span>
                        </div>
                      </div>
                      <span className={`font-bold ${i < 3 ? '' : 'text-slate-700'}`}>{item.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5" style={{ color: '#FF6600' }} />Alarmes por Data</CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Ano:</span>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {availableYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">Mês:</span>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {availableMonths.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {alarmsByDate.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400"><p>Selecione filtros para ver os dados</p></div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={alarmsByDate}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={70} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<AlarmDateCustomTooltip alarms={alarmsForTooltips} />} />
                        <Bar dataKey="alarmes" fill="#FF6600" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5" style={{ color: '#FF6600' }} />Acumulado por Mês</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Ano:</span>
                    <Select value={selectedYearAccum} onValueChange={setSelectedYearAccum}>
                      <SelectTrigger className="w-[100px]"><SelectValue placeholder="Ano" /></SelectTrigger>
                      <SelectContent>
                        {availableYears.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {alarmsByMonth.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400"><p>Nenhum dado disponível</p></div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={alarmsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<AlarmMonthCustomTooltip alarms={alarmsForTooltipsAccum} selectedYear={selectedYearAccum} />} />
                        <Legend />
                        <Area type="monotone" dataKey="alarmes" name="No mês" stroke="#FF6600" fill="#FF6600" fillOpacity={0.2} />
                        <Area type="monotone" dataKey="acumulado" name="Acumulado" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5" style={{ color: '#FF6600' }} />
                  Registros de Alarmes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-[200px]" />
                  <Badge variant="outline">{filteredAlarms.length}</Badge>
                  <Button variant="outline" size="sm" onClick={exportToExcel} disabled={filteredAlarms.length === 0} className="gap-1">
                    <Download className="h-4 w-4" />Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px] border rounded-lg">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold">Data/Hora</TableHead>
                      <TableHead className="font-semibold">Código</TableHead>
                      <TableHead className="font-semibold">Nome</TableHead>
                      <TableHead className="font-semibold">Máquina</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlarms.map((alarm, i) => (
                      <TableRow key={i} className="hover:bg-slate-50">
                        <TableCell className="font-medium"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" />{alarm.dateStr}</div></TableCell>
                        <TableCell><Badge variant="outline" className="font-mono text-xs">{alarm.code}</Badge></TableCell>
                        <TableCell className="max-w-[400px]" title={alarm.name}>{alarm.name}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-xs" style={{ color: MACHINE_COLORS[alarm.machine] || '#FF6600' }}>{alarm.machine}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ==================== MAIN ====================
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('temperatura');
  const [temperatureData, setTemperatureData] = useState<TempRecord[]>([]);
  const [alarmsData, setAlarmsData] = useState<AlarmRecord[]>([]);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupAction, setBackupAction] = useState<'export' | 'import'>('export');
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [pendingBackupFile, setPendingBackupFile] = useState<File | null>(null);
  const [exportTab, setExportTab] = useState<'temperatura' | 'alarmes' | 'ambos'>('ambos');
  const [importTab, setImportTab] = useState<'temperatura' | 'alarmes' | 'ambos'>('ambos');
  const [pendingImportData, setPendingImportData] = useState<any>(null);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    try {
      const storedTemp = localStorage.getItem('temperatureData');
      const storedAlarms = localStorage.getItem('alarmsData');
      
      if (storedTemp) {
        const parsed = JSON.parse(storedTemp);
        setTemperatureData(parsed.map((d: any) => ({
          ...d,
          date: new Date(d.date),
          parsedDate: new Date(d.parsedDate || d.date)
        })));
      }
      
      if (storedAlarms) {
        const parsed = JSON.parse(storedAlarms);
        setAlarmsData(parsed.map((d: any) => ({
          ...d,
          date: new Date(d.date)
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  }, []);

  // Salvar dados no localStorage quando mudar
  useEffect(() => {
    try {
      localStorage.setItem('temperatureData', JSON.stringify(temperatureData));
    } catch (error) {
      console.error('Erro ao salvar temperatura:', error);
    }
  }, [temperatureData]);

  useEffect(() => {
    try {
      localStorage.setItem('alarmsData', JSON.stringify(alarmsData));
    } catch (error) {
      console.error('Erro ao salvar alarmes:', error);
    }
  }, [alarmsData]);

  const handleTemperatureChange = (data: TempRecord[]) => {
    setTemperatureData(data);
  };

  const handleAlarmsChange = (data: AlarmRecord[]) => {
    setAlarmsData(data);
  };

  // Exportar backup
  const handleExportBackup = () => {
    setBackupAction('export');
    setExportTab('ambos');
    setShowBackupModal(true);
  };

  // Importar backup
  const handleImportBackupSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Ler o arquivo para verificar o conteúdo
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        setPendingImportData(data);
        setBackupAction('import');
        setImportTab('ambos');
        setShowBackupModal(true);
      } catch (error) {
        alert('Arquivo JSON inválido!');
      }
    };
    reader.readAsText(file);
    
    if (backupFileInputRef.current) backupFileInputRef.current.value = '';
  };

  // Confirmar backup
  const handleBackupConfirmed = async () => {
    setIsBackupLoading(true);
    try {
      if (backupAction === 'export') {
        const dateStr = new Date().toISOString().split('T')[0];
        let filename = '';
        let backupData: any = {
          exportedAt: new Date().toISOString(),
          version: '1.0'
        };
        
        if (exportTab === 'temperatura') {
          filename = `temperatura_${dateStr}.json`;
          backupData.temperature = temperatureData.map(d => ({
            ...d,
            date: d.date instanceof Date ? d.date.toISOString() : d.date,
            parsedDate: d.parsedDate instanceof Date ? d.parsedDate.toISOString() : (d.parsedDate || d.date)
          }));
        } else if (exportTab === 'alarmes') {
          filename = `alarmes_${dateStr}.json`;
          backupData.alarms = alarmsData.map(d => ({
            ...d,
            date: d.date instanceof Date ? d.date.toISOString() : d.date
          }));
        } else {
          filename = `backup_completo_${dateStr}.json`;
          backupData.temperature = temperatureData.map(d => ({
            ...d,
            date: d.date instanceof Date ? d.date.toISOString() : d.date,
            parsedDate: d.parsedDate instanceof Date ? d.parsedDate.toISOString() : (d.parsedDate || d.date)
          }));
          backupData.alarms = alarmsData.map(d => ({
            ...d,
            date: d.date instanceof Date ? d.date.toISOString() : d.date
          }));
        }
        
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
      } else if (backupAction === 'import' && pendingImportData) {
        let importCount = 0;
        
        if ((importTab === 'temperatura' || importTab === 'ambos') && pendingImportData.temperature) {
          const tempData = pendingImportData.temperature.map((d: any) => ({
            ...d,
            date: new Date(d.date),
            parsedDate: new Date(d.parsedDate || d.date)
          }));
          setTemperatureData(tempData);
          importCount += tempData.length;
        }
        
        if ((importTab === 'alarmes' || importTab === 'ambos') && pendingImportData.alarms) {
          const alarmData = pendingImportData.alarms.map((d: any) => ({
            ...d,
            date: new Date(d.date)
          }));
          setAlarmsData(alarmData);
          importCount += alarmData.length;
        }
        
        alert(`Backup importado com sucesso! ${importCount} registros carregados.`);
        setPendingImportData(null);
      }
    } catch (error) {
      console.error('Erro no backup:', error);
      alert('Erro ao processar backup!');
    } finally {
      setIsBackupLoading(false);
      setShowBackupModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PasswordModal
        open={showBackupModal}
        onOpenChange={(open) => { setShowBackupModal(open); if (!open) setPendingImportData(null); }}
        onConfirm={handleBackupConfirmed}
        title={backupAction === 'export' ? 'Exportar Backup JSON' : 'Importar Backup JSON'}
        description="Digite a senha de administrador para continuar."
        backupAction={backupAction}
        selectedTab={backupAction === 'export' ? exportTab : importTab}
        onTabChange={(tab) => backupAction === 'export' ? setExportTab(tab) : setImportTab(tab)}
        showTabSelector={true}
      />
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain" />
            <div className="flex-1 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleExportBackup} disabled={isBackupLoading} className="gap-1 text-xs">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar Backup</span>
              </Button>
              <input ref={backupFileInputRef} type="file" accept=".json" onChange={handleImportBackupSelect} className="hidden" id="backup-file-upload" />
              <Button variant="outline" size="sm" onClick={() => backupFileInputRef.current?.click()} disabled={isBackupLoading} className="gap-1 text-xs">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Importar Backup</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-slate-100 rounded-lg p-1">
            <TabsTrigger value="temperatura" className="gap-2 data-[state=active]:text-white" style={{ backgroundColor: activeTab === 'temperatura' ? '#FF6600' : 'transparent' }}>
              <Thermometer className="h-4 w-4" />Temperatura
            </TabsTrigger>
            <TabsTrigger value="alarmes" className="gap-2 data-[state=active]:text-white" style={{ backgroundColor: activeTab === 'alarmes' ? '#FF6600' : 'transparent' }}>
              <AlertCircle className="h-4 w-4" />Alarmes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperatura">
            <TemperatureDashboard data={temperatureData} onDataChange={handleTemperatureChange} />
          </TabsContent>
          <TabsContent value="alarmes">
            <AlarmsDashboard data={alarmsData} onDataChange={handleAlarmsChange} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center text-sm text-slate-400">
          Analise Alarme e Temperatura ZA
        </div>
      </footer>
    </div>
  );
}
