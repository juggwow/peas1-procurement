import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex flex-shrink-0 items-center gap-2">
              <ClipboardList className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl tracking-tight text-gray-900">ระบบบันทึกคณะกรรมการกลั่นกรอง กรรมการจำหน่าย</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
