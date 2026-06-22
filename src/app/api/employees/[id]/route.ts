import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (employee) {
      return NextResponse.json(employee);
    }

    return NextResponse.json({ error: 'ไม่พบข้อมูลพนักงาน' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, position, departmentName } = body;

    if (!name || !position || !departmentName) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name,
        position,
        departmentName,
      }
    });

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Failed to update employee:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลพนักงาน' }, { status: 500 });
  }
}
