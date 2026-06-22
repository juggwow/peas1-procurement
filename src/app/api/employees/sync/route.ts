import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Define the schema for incoming employee data
const employeeSyncSchema = z.array(z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: z.string().min(1),
  departmentName: z.string().min(1),
  officeTel: z.string().nullable().optional(),
  mobileTel: z.string().nullable().optional(),
  faxTel: z.string().nullable().optional(),
}));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const employees = employeeSyncSchema.parse(body);

    if (employees.length === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลในไฟล์ หรือรูปแบบไม่ถูกต้อง' }, { status: 400 });
    }

    // Run deleteMany and createMany inside a transaction
    // If createMany fails, deleteMany will be rolled back automatically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete all existing employees
      await tx.employee.deleteMany({});

      // 2. Insert all new employees
      // Prisma's createMany is optimized for bulk inserts
      const created = await tx.employee.createMany({
        data: employees,
        skipDuplicates: true, // Optional: handle potential duplicates gracefully
      });

      return created;
    }, {
      maxWait: 5000,
      timeout: 20000 // allow up to 20 seconds for massive bulk inserts
    });

    return NextResponse.json({ 
      success: true, 
      message: `อัปเดตข้อมูลพนักงานสำเร็จ จำนวน ${result.count} รายการ` 
    });

  } catch (error: any) {
    console.error('Failed to sync employees:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง กรุณาตรวจสอบไฟล์ CSV', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตฐานข้อมูล' }, { status: 500 });
  }
}
