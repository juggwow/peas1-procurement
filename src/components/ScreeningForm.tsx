'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import EmployeeSearchModal from './EmployeeSearchModal';

const formSchema = z.object({
  creatorEmpId: z.string().min(1, 'จำเป็นต้องระบุ'),
  creatorName: z.string().min(1, 'จำเป็นต้องระบุ'),
  creatorPosition: z.string().min(1, 'จำเป็นต้องระบุ'),
  creatorDepartmentName: z.string().min(1, 'จำเป็นต้องระบุ'),
  title: z.string().min(1, 'จำเป็นต้องระบุ'),
  orderNumber: z.string().optional(),
  committee: z.array(z.object({
    empId: z.string().min(1, 'จำเป็นต้องระบุ'),
    role: z.string().min(1, 'จำเป็นต้องระบุ'),
    name: z.string().min(1, 'จำเป็นต้องระบุ'),
    position: z.string().min(1, 'จำเป็นต้องระบุ'),
    departmentName: z.string().min(1, 'จำเป็นต้องระบุ')
  })).min(3, 'ต้องมีคณะกรรมการอย่างน้อย 3 คน').max(5, 'คณะกรรมการต้องไม่เกิน 5 คน')
});

type FormValues = z.infer<typeof formSchema>;

interface ScreeningFormProps {
  initialData?: FormValues & { id: string };
}
export default function ScreeningForm({ initialData }: ScreeningFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSearching, setIsSearching] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [modalTarget, setModalTarget] = useState<'creator' | number | null>(null);

  const isEditMode = !!initialData;

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      creatorEmpId: '',
      creatorName: '',
      creatorPosition: '',
      creatorDepartmentName: '',
      title: '',
      orderNumber: '',
      committee: [
        { empId: '', role: 'CHAIRMAN', name: '', position: '', departmentName: '' },
        { empId: '', role: 'MEMBER', name: '', position: '', departmentName: '' },
        { empId: '', role: 'MEMBER', name: '', position: '', departmentName: '' }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'committee'
  });

  const watchCreatorEmpId = watch('creatorEmpId');

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      if (initialData) {
        await axios.put(`/api/screenings/${initialData.id}`, data);
      } else {
        await axios.post('/api/screenings', data);
      }
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setSubmitError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchEmployee = async (empId: string, index?: number) => {
    if (!empId) {
      window.alert('กรุณากรอกรหัสพนักงานก่อนค้นหา');
      return;
    }

    setIsSearching(index !== undefined ? `committee-${index}` : 'creator');
    try {
      const res = await axios.get(`/api/employees/${empId}`);
      setModalData(res.data);
      setModalTarget(index !== undefined ? index : 'creator');
      setIsModalOpen(true);
    } catch (error) {
      window.alert(`ไม่พบข้อมูลพนักงานรหัส ${empId}`);
    } finally {
      setIsSearching(null);
    }
  };

  const handleSelectEmployee = (data: any) => {
    if (modalTarget === 'creator') {
      setValue('creatorName', data.name);
      setValue('creatorPosition', data.position);
      setValue('creatorDepartmentName', data.departmentName);
    } else if (typeof modalTarget === 'number') {
      setValue(`committee.${modalTarget}.name`, data.name);
      setValue(`committee.${modalTarget}.position`, data.position);
      setValue(`committee.${modalTarget}.departmentName`, data.departmentName);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">

        {submitError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {submitError}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">ข้อมูลทั่วไป</h2>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">ชื่อการไฟฟ้า *</label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('title')}
                  className="bg-white text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  placeholder="เช่น กฟจ.ระยอง"
                />
              </div>
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="sm:col-span-2 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสพนักงานของผู้สร้าง *</label>
                <div className="mt-1 flex items-center">
                  <input
                    type="text"
                    {...register('creatorEmpId')}
                    readOnly={isEditMode}
                    className={`bg-white text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  />
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => handleSearchEmployee(watchCreatorEmpId)}
                      disabled={isSearching === 'creator' || !watchCreatorEmpId}
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {isSearching === 'creator' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ค้นหา'}
                    </button>
                  )}
                </div>
                {errors.creatorEmpId && <p className="mt-1 text-sm text-red-600">{errors.creatorEmpId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล *</label>
                <div className="mt-1">
                  <input
                    type="text"
                    {...register('creatorName')}
                    readOnly={true}
                    className="bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md py-2 px-3 border"
                  />
                </div>
                {errors.creatorName && <p className="mt-1 text-sm text-red-600">{errors.creatorName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ตำแหน่ง *</label>
                <div className="mt-1">
                  <input
                    type="text"
                    {...register('creatorPosition')}
                    readOnly={true}
                    className="bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md py-2 px-3 border"
                  />
                </div>
                {errors.creatorPosition && <p className="mt-1 text-sm text-red-600">{errors.creatorPosition.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">สังกัด *</label>
                <div className="mt-1">
                  <input
                    type="text"
                    {...register('creatorDepartmentName')}
                    readOnly={true}
                    className="bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md py-2 px-3 border"
                  />
                </div>
                {errors.creatorDepartmentName && <p className="mt-1 text-sm text-red-600">{errors.creatorDepartmentName.message}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-semibold text-gray-900">คณะกรรมการกลั่นกรอง/จำหน่าย</h2>
            {fields.length < 5 && (
              <button
                type="button"
                onClick={() => append({ empId: '', role: 'MEMBER', name: '', position: '', departmentName: '' })}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                เพิ่มคณะกรรมการ
              </button>
            )}
          </div>

          {errors.committee?.root && (
            <p className="text-sm text-red-600">{errors.committee.root.message}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => {
              const watchedEmpId = watch(`committee.${index}.empId`);
              return (
                <div key={field.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">รหัสพนักงาน *</label>
                      <div className="mt-1 flex items-center">
                        <input
                          {...register(`committee.${index}.empId`)}
                          className="bg-white text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                          placeholder="เช่น 1001"
                        />
                        <button
                          type="button"
                          onClick={() => handleSearchEmployee(watchedEmpId, index)}
                          disabled={isSearching === `committee-${index}` || !watchedEmpId}
                          className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {isSearching === `committee-${index}` ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ค้นหา'}
                        </button>
                      </div>
                      {errors.committee?.[index]?.empId && (
                        <p className="mt-1 text-sm text-red-600">{errors.committee[index]?.empId?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ตำแหน่งหน้าที่ในกรรมการ *</label>
                      <select
                        {...register(`committee.${index}.role`)}
                        className="mt-1 bg-white text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                      >
                        <option value="CHAIRMAN">ประธานคณะกรรมการ</option>
                        <option value="MEMBER">คณะกรรมการ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล *</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          {...register(`committee.${index}.name`)}
                          readOnly={true}
                          className="bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md py-2 px-3 border"
                        />
                      </div>
                      {errors.committee?.[index]?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.committee[index]?.name?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ตำแหน่ง *</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          {...register(`committee.${index}.position`)}
                          readOnly={true}
                          className="bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md py-2 px-3 border"
                        />
                      </div>
                      {errors.committee?.[index]?.position && (
                        <p className="mt-1 text-sm text-red-600">{errors.committee[index]?.position?.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">สังกัด *</label>
                      <div className="mt-1">
                        <input
                          type="text"
                          {...register(`committee.${index}.departmentName`)}
                          readOnly={true}
                          className="bg-gray-100 text-gray-500 cursor-not-allowed shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md py-2 px-3 border"
                        />
                      </div>
                      {errors.committee?.[index]?.departmentName && (
                        <p className="mt-1 text-sm text-red-600">{errors.committee[index]?.departmentName?.message}</p>
                      )}
                    </div>
                  </div>
                  {fields.length > 3 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                บันทึกข้อมูล
              </>
            )}
          </button>
        </div>
      </form>
      {modalData && (
        <EmployeeSearchModal
          isOpen={isModalOpen}
          initialData={modalData}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectEmployee}
        />
      )}
    </>
  );
}
