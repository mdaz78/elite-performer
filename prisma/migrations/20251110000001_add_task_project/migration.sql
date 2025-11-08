-- CreateTable
CREATE TABLE "TaskProject" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskProject_status_idx" ON "TaskProject"("status");

-- CreateIndex
CREATE INDEX "TaskProject_userId_idx" ON "TaskProject"("userId");

-- AddForeignKey
ALTER TABLE "TaskProject" ADD CONSTRAINT "TaskProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddColumn: Add taskProjectId to Task table
ALTER TABLE "Task" ADD COLUMN "taskProjectId" INTEGER;

-- Migrate existing data: Create TaskProjects from Projects that have tasks
INSERT INTO "TaskProject" ("userId", "name", "description", "status", "startDate", "targetDate", "createdAt")
SELECT DISTINCT
    p."userId",
    p."name",
    p."description",
    p."status",
    p."startDate",
    p."targetDate",
    p."createdAt"
FROM "Project" p
INNER JOIN "Task" t ON t."projectId" = p."id";

-- Update Task table: Set taskProjectId based on projectId
UPDATE "Task" t
SET "taskProjectId" = tp."id"
FROM "TaskProject" tp
INNER JOIN "Project" p ON p."userId" = tp."userId" AND p."name" = tp."name" AND p."status" = tp."status"
WHERE t."projectId" = p."id";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_taskProjectId_fkey" FOREIGN KEY ("taskProjectId") REFERENCES "TaskProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Task_taskProjectId_idx" ON "Task"("taskProjectId");

-- DropForeignKey: Remove old project relation from Task
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_projectId_fkey";

-- DropIndex: Remove old projectId index
DROP INDEX IF EXISTS "Task_projectId_idx";

-- DropColumn: Remove projectId from Task
ALTER TABLE "Task" DROP COLUMN "projectId";

-- DropForeignKey: Remove tasks relation from Project (if it exists)
-- Note: This is just cleanup, the relation was already removed from schema
