import ProcurementForm from '@/components/ProcurementForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditProcurementPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  let procurement;
  try {
    procurement = await prisma.procurement.findUnique({
      where: { id },
      include: { committee: true }
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }

  if (!procurement) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center">
        <Link href="/" className="text-gray-500 hover:text-gray-700 mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Procurement</h1>
      </div>
      <ProcurementForm 
        initialData={{
          ...procurement,
          orderNumber: procurement.orderNumber || undefined
        }} 
      />
    </div>
  );
}
