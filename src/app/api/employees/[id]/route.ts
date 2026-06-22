import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
