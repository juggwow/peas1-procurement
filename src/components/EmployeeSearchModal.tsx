'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import axios from 'axios';

interface EmployeeData {
  id: string;
  name: string;
  position: string;
  departmentName: string;
}

interface EmployeeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: EmployeeData) => void;
  initialData: EmployeeData;
}

export default function EmployeeSearchModal({
  isOpen,
  onClose,
  onSelect,
  initialData,
}: EmployeeSearchModalProps) {
  const [formData, setFormData] = useState<EmployeeData>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setError('');
      await axios.put(`/api/employees/${formData.id}`, {
        name: formData.name,
        position: formData.position,
        departmentName: formData.departmentName,
      });
      window.alert('บันทึกการแก้ไขข้อมูลพนักงานสำเร็จ');
    } catch (err: any) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลพนักงาน');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelect = () => {
    onSelect(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 z-10">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                ตรวจสอบและแก้ไขข้อมูลพนักงาน
              </h3>
              
              <div className="mt-4 space-y-4">
                {error && (
                  <div className="p-2 text-sm text-red-700 bg-red-100 rounded-md">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน</label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled
                    className="block w-full mt-1 text-sm border-gray-300 rounded-md bg-gray-100 text-gray-500 shadow-sm px-3 py-2 border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ตำแหน่ง</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ฝ่าย/แผนก</label>
                  <input
                    type="text"
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    className="block w-full mt-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleSelect}
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50 items-center"
            >
              เลือกใช้งาน
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleUpdate}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-white border border-transparent rounded-md shadow-sm bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:mt-0 sm:w-auto sm:text-sm items-center"
            >
              {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
