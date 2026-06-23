import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import prisma from '@/lib/prisma';
import ScreeningRowActions from '@/components/ScreeningRowActions';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ creatorEmpId?: string; committeeEmpId?: string; title?: string }>
}) {
  const { creatorEmpId, committeeEmpId, title } = await searchParams;

  const where: any = {};
  if (creatorEmpId) where.creatorEmpId = { contains: creatorEmpId, mode: 'insensitive' };
  if (title) where.title = { contains: title, mode: 'insensitive' };
  if (committeeEmpId) {
    where.committee = { some: { empId: { contains: committeeEmpId, mode: 'insensitive' } } };
  }

  let screenings: any[] = [];
  try {
    screenings = await prisma.screening.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { committee: true }
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">รายการกลั่นกรอง</h1>
        <Link 
          href="/screenings/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          สร้างรายการใหม่
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form className="flex flex-col md:flex-row gap-4" method="GET" action="/">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผู้สร้าง</label>
            <input 
              type="text" 
              name="creatorEmpId"
              defaultValue={creatorEmpId || ''}
              placeholder="เช่น 1001"
              className="bg-white text-black block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border" 
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสกรรมการ</label>
            <input 
              type="text" 
              name="committeeEmpId"
              defaultValue={committeeEmpId || ''}
              placeholder="เช่น 1002"
              className="bg-white text-black block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border" 
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่องาน</label>
            <input 
              type="text" 
              name="title"
              defaultValue={title || ''}
              placeholder="ค้นหาชื่องาน..."
              className="bg-white text-black block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm py-2 px-3 border" 
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <Search className="h-4 w-4 mr-2" />
              ค้นหา
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {screenings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่องาน</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้สร้าง</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คณะกรรมการ</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">แก้ไข</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {screenings.map((scr) => (
                  <tr key={scr.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{scr.title}</div>
                      {scr.orderNumber && <div className="text-sm text-gray-500">เลขที่คำสั่ง: {scr.orderNumber}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scr.creatorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-col gap-1 w-64">
                        {scr.committee.map((c: any) => (
                          <div key={c.id} className="flex items-center text-xs">
                            <span className="inline-block w-16 font-medium text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded mr-2 text-center">
                              {c.role === 'CHAIRMAN' ? 'ประธาน' : 'กรรมการ'}
                            </span>
                            <span className="text-gray-800">{c.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(scr.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ScreeningRowActions screeningId={scr.id} creatorEmpId={scr.creatorEmpId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีรายการกลั่นกรอง</h3>
            <p className="mt-1 text-sm text-gray-500">เริ่มต้นด้วยการสร้างรายการกลั่นกรองใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
}
