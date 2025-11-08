-- AlterTable
ALTER TABLE "CourseModule" ADD COLUMN "scheduledDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TradingCourseModule" ADD COLUMN "scheduledDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "CourseModule_scheduledDate_idx" ON "CourseModule"("scheduledDate");

-- CreateIndex
CREATE INDEX "TradingCourseModule_scheduledDate_idx" ON "TradingCourseModule"("scheduledDate");
