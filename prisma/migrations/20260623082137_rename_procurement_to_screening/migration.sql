-- CreateTable
CREATE TABLE "Screening" (
    "id" TEXT NOT NULL,
    "creatorEmpId" TEXT NOT NULL,
    "creatorName" TEXT NOT NULL,
    "creatorPosition" TEXT NOT NULL,
    "creatorDepartmentName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "orderNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Screening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitteeMember" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "screeningId" TEXT NOT NULL,

    CONSTRAINT "CommitteeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officeTel" TEXT,
    "mobileTel" TEXT,
    "faxTel" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommitteeMember" ADD CONSTRAINT "CommitteeMember_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "Screening"("id") ON DELETE CASCADE ON UPDATE CASCADE;
