-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('working', 'idle', 'absent', 'product_count');

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workstation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workstation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "workerId" TEXT NOT NULL,
    "workstationId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "count" INTEGER,
    "modelVersion" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_workerId_timestamp_idx" ON "Event"("workerId", "timestamp");

-- CreateIndex
CREATE INDEX "Event_workstationId_timestamp_idx" ON "Event"("workstationId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Event_workerId_timestamp_eventType_key" ON "Event"("workerId", "timestamp", "eventType");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
