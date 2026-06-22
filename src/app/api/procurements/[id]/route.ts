import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateProcurementSchema = z.object({
  creatorEmpId: z.string().min(1, 'Creator Emp ID is required'),
  creatorName: z.string().min(1, 'Creator Name is required'),
  creatorPosition: z.string().min(1, 'Creator Position is required'),
  creatorDepartmentName: z.string().min(1, 'Creator Department is required'),
  title: z.string().min(1, 'Title is required'),
  orderNumber: z.string().optional().nullable(),
  committee: z.array(z.object({
    empId: z.string().min(1, 'Employee ID is required'),
    role: z.string().min(1, 'Role is required'),
    name: z.string().min(1, 'Name is required'),
    position: z.string().min(1, 'Position is required'),
    departmentName: z.string().min(1, 'Department is required')
  })).min(3, 'At least 3 committee members are required').max(5, 'At most 5 committee members are allowed')
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const procurement = await prisma.procurement.findUnique({
      where: { id },
      include: { committee: true }
    });

    if (!procurement) {
      return NextResponse.json({ error: 'Procurement not found' }, { status: 404 });
    }

    return NextResponse.json(procurement);
  } catch (error) {
    console.error('Failed to fetch procurement:', error);
    return NextResponse.json({ error: 'Failed to fetch procurement' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProcurementSchema.parse(body);

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

      // Delete existing committee members
      await tx.committeeMember.deleteMany({
        where: { procurementId: id }
      });

      // Update procurement and create new committee members
      const updated = await tx.procurement.update({
        where: { id },
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

      return updated;
    }, {
      maxWait: 5000,
      timeout: 10000
    });

    return NextResponse.json(procurement);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    if (error.message && error.message.startsWith('ไม่พบรหัสพนักงาน')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Failed to update procurement:', error);
    return NextResponse.json({ error: 'Failed to update procurement' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { creatorEmpId } = body;

    if (!creatorEmpId) {
      return NextResponse.json({ error: 'Creator Emp ID is required for deletion' }, { status: 400 });
    }

    const procurement = await prisma.procurement.findUnique({
      where: { id }
    });

    if (!procurement) {
      return NextResponse.json({ error: 'Procurement not found' }, { status: 404 });
    }

    if (procurement.creatorEmpId !== creatorEmpId) {
      return NextResponse.json({ error: 'Unauthorized: Invalid creator employee ID' }, { status: 403 });
    }

    await prisma.procurement.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete procurement:', error);
    return NextResponse.json({ error: 'Failed to delete procurement' }, { status: 500 });
  }
}
