/**
 * MaxReport Pro - Equipment API
 * CRUD operations for equipment
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/equipment - List all equipment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const active = searchParams.get('active')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
      ]
    }
    if (type) {
      where.type = type
    }
    if (active !== null) {
      where.active = active === 'true'
    }

    const equipment = await db.equipment.findMany({
      where,
      orderBy: [
        { code: 'asc' }
      ]
    })

    return NextResponse.json({ equipment })
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    )
  }
}

// POST /api/equipment - Create new equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const equipment = await db.equipment.create({
      data: {
        code: body.code,
        name: body.name,
        type: body.type,
        model: body.model,
        location: body.location,
        hourMeter: body.hourMeter || 0,
        active: body.active ?? true,
      }
    })

    return NextResponse.json({ equipment }, { status: 201 })
  } catch (error) {
    console.error('Error creating equipment:', error)
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    )
  }
}
