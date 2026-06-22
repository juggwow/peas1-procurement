'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function ProcurementRowActions({ 
  procurementId, 
  creatorEmpId 
}: { 
  procurementId: string;
  creatorEmpId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const input = window.prompt('เพื่อยืนยันการลบ กรุณากรอกรหัสพนักงานของผู้สร้าง');
    
    if (input === null) return; // User cancelled

    if (input !== creatorEmpId) {
      window.alert('รหัสพนักงานไม่ถูกต้อง ยกเลิกการลบรายการ');
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/procurements/${procurementId}`, {
        data: { creatorEmpId: input }
      });
      router.refresh();
    } catch (error: any) {
      const msg = error.response?.data?.error || 'เกิดข้อผิดพลาดในการลบรายการ';
      window.alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-3">
      <Link 
        href={`/procurements/${procurementId}/edit`} 
        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
      >
        <Edit2 className="h-4 w-4 mr-1" />
        แก้ไข
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        {isDeleting ? 'กำลังลบ...' : 'ลบ'}
      </button>
    </div>
  );
}
