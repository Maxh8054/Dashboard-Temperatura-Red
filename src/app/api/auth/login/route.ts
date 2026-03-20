import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// Default password for all users
const DEFAULT_PASSWORD = '2026'

// Seed initial users if they don't exist
async function seedUsers() {
  const users = [
    { name: 'Max Henrique', email: 'max@maxreport.com' },
    { name: 'Marcos Paulo', email: 'marcos@maxreport.com' },
    { name: 'Marcelo Gonçalves', email: 'marcelo@maxreport.com' },
    { name: 'Wesley Ferreira', email: 'wesley@maxreport.com' },
    { name: 'Higor Ataides', email: 'higor@maxreport.com' },
  ]

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  for (const user of users) {
    const existing = await db.user.findUnique({
      where: { email: user.email }
    })

    if (!existing) {
      await db.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: 'technician'
        }
      })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json()

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Nome e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Seed users on first login attempt
    await seedUsers()

    // Find user by name
    const user = await db.user.findFirst({
      where: { name }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      )
    }

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    // Create response with cookie
    const response = NextResponse.json({ user: userData })
    
    // Set session cookie
    response.cookies.set('session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
