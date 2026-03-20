import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dataPath = path.join(process.cwd(), 'data');

// Garantir que o diretório existe
const ensureDataDir = () => {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
};

const temperatureFile = path.join(dataPath, 'temperature.json');
const alarmsFile = path.join(dataPath, 'alarms.json');

// GET - Carregar dados
export async function GET() {
  try {
    ensureDataDir();
    
    let temperatureData = [];
    let alarmsData = [];
    
    if (fs.existsSync(temperatureFile)) {
      const content = fs.readFileSync(temperatureFile, 'utf-8');
      temperatureData = JSON.parse(content);
    }
    
    if (fs.existsSync(alarmsFile)) {
      const content = fs.readFileSync(alarmsFile, 'utf-8');
      alarmsData = JSON.parse(content);
    }
    
    return NextResponse.json({ temperature: temperatureData, alarms: alarmsData });
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return NextResponse.json({ temperature: [], alarms: [] });
  }
}

// POST - Salvar dados
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, password, temperature, alarms } = body;
    
    // Verificar senha
    if (password !== '2026') {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }
    
    ensureDataDir();
    
    if (type === 'temperature' && data) {
      fs.writeFileSync(temperatureFile, JSON.stringify(data, null, 2));
    } else if (type === 'alarms' && data) {
      fs.writeFileSync(alarmsFile, JSON.stringify(data, null, 2));
    } else if (type === 'all') {
      if (temperature) {
        fs.writeFileSync(temperatureFile, JSON.stringify(temperature, null, 2));
      }
      if (alarms) {
        fs.writeFileSync(alarmsFile, JSON.stringify(alarms, null, 2));
      }
    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 });
  }
}

// DELETE - Limpar dados
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const password = searchParams.get('password');
    
    // Verificar senha
    if (password !== '2026') {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }
    
    ensureDataDir();
    
    if (type === 'temperature') {
      if (fs.existsSync(temperatureFile)) {
        fs.writeFileSync(temperatureFile, '[]');
      }
    } else if (type === 'alarms') {
      if (fs.existsSync(alarmsFile)) {
        fs.writeFileSync(alarmsFile, '[]');
      }
    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return NextResponse.json({ error: 'Erro ao limpar dados' }, { status: 500 });
  }
}
