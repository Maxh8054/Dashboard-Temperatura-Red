import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET all users (for login dropdown)
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: { name: 'asc' }
    })

    // If no users exist, seed them
    if (users.length === 0) {
      const defaultUsers = [
        { name: 'Max Henrique', email: 'max@maxreport.com' },
        { name: 'Marcos Paulo', email: 'marcos@maxreport.com' },
        { name: 'Marcelo Gonçalves', email: 'marcelo@maxreport.com' },
        { name: 'Wesley Ferreira', email: 'wesley@maxreport.com' },
        { name: 'Higor Ataides', email: 'higor@maxreport.com' },
      ]

      const hashedPassword = await bcrypt.hash('2026', 10)

      for (const user of defaultUsers) {
        await db.user.create({
          data: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: 'technician'
          }
        })
      }

      const newUsers = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        },
        orderBy: { name: 'asc' }
      })

      return NextResponse.json({ users: newUsers })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ users: [] })
  }
}
