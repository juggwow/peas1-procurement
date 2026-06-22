import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createProcurementSchema = z.object({
  creatorEmpId: z.string().min(1, 'Creator Emp ID is required'),
  creatorName: z.string().min(1, 'Creator Name is required'),
  creatorPosition: z.string().min(1, 'Creator Position is required'),
  creatorDepartmentName: z.string().min(1, 'Creator Department is required'),
  title: z.string().min(1, 'Title is required'),
  orderNumber: z.string().optional(),
  committee: z.array(z.object({
    empId: z.string().min(1, 'Employee ID is required'),
    role: z.string().min(1, 'Role is required'),
    name: z.string().min(1, 'Name is required'),
    position: z.string().min(1, 'Position is required'),
    departmentName: z.string().min(1, 'Department is required')
  })).min(3, 'At least 3 committee members are required').max(5, 'At most 5 committee members are allowed')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createProcurementSchema.parse(body);

    const procurement = await prisma.$transaction(async (tx) => {
      // Update creator employee
      await tx.employee.update({
        where: { id: parsed.creatorEmpId },
        data: {
          name: parsed.creatorName,
          position: parsed.creatorPosition,
          departmentName: parsed.creatorDepartmentName,
        }
      }).catch(() => {
        throw new Error(`ไม่พบรหัสพนักงานของผู้สร้าง: ${parsed.creatorEmpId}`);
      });

      // Update committee members
      for (const member of parsed.committee) {
        await tx.employee.update({
          where: { id: member.empId },
          data: {
            name: member.name,
            position: member.position,
            departmentName: member.departmentName,
          }
        }).catch(() => {
          throw new Error(`ไม่พบรหัสพนักงานคณะกรรมการ: ${member.empId}`);
        });
      }

      return await tx.procurement.create({
        data: {
          creatorEmpId: parsed.creatorEmpId,
          creatorName: parsed.creatorName,
          creatorPosition: parsed.creatorPosition,
          creatorDepartmentName: parsed.creatorDepartmentName,
          title: parsed.title,
          orderNumber: parsed.orderNumber || null,
          committee: {
            create: parsed.committee.map(member => ({
              empId: member.empId,
              role: member.role,
              name: member.name,
              position: member.position,
              departmentName: member.departmentName,
            }))
          }
        },
        include: {
          committee: true
        }
      });
    }, {
      maxWait: 5000,
      timeout: 10000
    });

    return NextResponse.json(procurement, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    if (error.message && error.message.startsWith('ไม่พบรหัสพนักงาน')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Failed to create procurement:', error);
    return NextResponse.json({ error: 'Failed to create procurement' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorEmpId = searchParams.get('creatorEmpId');
    const committeeEmpId = searchParams.get('committeeEmpId');
    const title = searchParams.get('title');

    const where: any = {};

    if (creatorEmpId) {
      where.creatorEmpId = { contains: creatorEmpId, mode: 'insensitive' };
    }

    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    if (committeeEmpId) {
      where.committee = {
        some: {
          empId: { contains: committeeEmpId, mode: 'insensitive' }
        }
      };
    }

    const procurements = await prisma.procurement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        committee: true,
      }
    });

    return NextResponse.json(procurements);
  } catch (error) {
    console.error('Failed to fetch procurements:', error);
    return NextResponse.json({ error: 'Failed to fetch procurements' }, { status: 500 });
  }
}
