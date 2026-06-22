'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { Upload, AlertCircle, CheckCircle2, Loader2, FileSpreadsheet, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus({ type: null, message: '' });
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Parse the CSV file using PapaParse
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Normalize headers if they are in Thai
          const normalizedData = results.data.map((row: any) => {
            return {
              id: row['id'] || row['รหัสพนักงาน'],
              name: row['name'] || row['ชื่อ-นามสกุล'],
              position: row['position'] || row['ตำแหน่ง'],
              departmentName: row['departmentName'] || row['ฝ่าย/แผนก'] || row['สังกัด'],
              officeTel: row['officeTel'] || row['เบอร์ที่ทำงาน'] || null,
              mobileTel: row['mobileTel'] || row['เบอร์มือถือ'] || null,
              faxTel: row['faxTel'] || row['แฟกซ์'] || null,
            };
          }).filter((row: any) => row.id && row.name); // Filter out rows without basic ID and Name

          setTotalRows(normalizedData.length);
          setPreviewData(normalizedData.slice(0, 5)); // Preview only first 5 rows
        },
        error: (error) => {
          setStatus({ type: 'error', message: `เกิดข้อผิดพลาดในการอ่านไฟล์: ${error.message}` });
        }
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus({ type: null, message: '' });

    // Parse completely one more time to get all data
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const normalizedData = results.data.map((row: any) => {
          return {
            id: String(row['id'] || row['รหัสพนักงาน'] || ''),
            name: String(row['name'] || row['ชื่อ-นามสกุล'] || ''),
            position: String(row['position'] || row['ตำแหน่ง'] || ''),
            departmentName: String(row['departmentName'] || row['ฝ่าย/แผนก'] || row['สังกัด'] || ''),
            officeTel: row['officeTel'] || row['เบอร์ที่ทำงาน'] || null,
            mobileTel: row['mobileTel'] || row['เบอร์มือถือ'] || null,
            faxTel: row['faxTel'] || row['แฟกซ์'] || null,
          };
        }).filter((row: any) => row.id && row.name);

        try {
          const response = await axios.post('/api/employees/sync', normalizedData);
          setStatus({ type: 'success', message: response.data.message || 'อัปโหลดข้อมูลสำเร็จ' });
          setFile(null);
          setPreviewData([]);
          setTotalRows(0);
          // clear input
          const input = document.getElementById('file-upload') as HTMLInputElement;
          if (input) input.value = '';
        } catch (error: any) {
          setStatus({
            type: 'error',
            message: error.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
          });
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  const handleDownloadSample = () => {
    const csvContent = "รหัสพนักงาน,ชื่อ-นามสกุล,ตำแหน่ง,สังกัด,เบอร์ที่ทำงาน,เบอร์มือถือ,แฟกซ์\n1001,สมชาย ใจดี,ผู้จัดการ,ฝ่ายไอที,021234567,0812345678,021234568\n1002,สมหญิง รักดี,พนักงาน,ฝ่ายบุคคล,021234569,,,";
    // Add BOM so Excel opens UTF-8 correctly
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_employees.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">อัปโหลดข้อมูลพนักงาน (Admin)</h1>
              <p className="mt-2 text-sm text-gray-600">
                อัปโหลดไฟล์ CSV เพื่อแทนที่ข้อมูลพนักงานทั้งหมดในระบบ ระบบจะทำการลบข้อมูลเก่าและใส่ข้อมูลใหม่ให้โดยอัตโนมัติ<br />
                ดาวน์โหลดตัวอย่าง CSV เพื่อให้สามารถอัปเดทข้อมูลได้อย่างถูกต้อง
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" />
              ดาวน์โหลดไฟล์ตัวอย่าง
            </button>
          </div>

          {status.message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-10 text-center hover:bg-gray-50 transition-colors">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>เลือกไฟล์ CSV</span>
                  <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
                </label>
                <p className="pl-1">หรือลากไฟล์มาวางที่นี่</p>
              </div>
              <p className="text-xs leading-5 text-gray-500">เฉพาะไฟล์ .csv เท่านั้น</p>
            </div>

            {file && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">ไฟล์ที่เลือก: {file.name}</h3>
                    <p className="text-xs text-gray-500">พบข้อมูลจำนวน {totalRows} รายการ</p>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading || totalRows === 0}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังอัปโหลด...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        ยืนยันการอัปโหลด
                      </>
                    )}
                  </button>
                </div>

                {previewData.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">ตัวอย่างข้อมูล (5 รายการแรก)</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">รหัส</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">ชื่อ-นามสกุล</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">ตำแหน่ง</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">สังกัด</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.map((row, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{row.id}</td>
                              <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{row.name}</td>
                              <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{row.position}</td>
                              <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{row.departmentName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
