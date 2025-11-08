-- CreateTable
CREATE TABLE "TradingCourse" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),

    CONSTRAINT "TradingCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingCourseModule" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TradingCourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TradingCourse_userId_idx" ON "TradingCourse"("userId");

-- CreateIndex
CREATE INDEX "TradingCourse_createdAt_idx" ON "TradingCourse"("createdAt");

-- CreateIndex
CREATE INDEX "TradingCourseModule_courseId_idx" ON "TradingCourseModule"("courseId");

-- CreateIndex
CREATE INDEX "TradingCourseModule_completed_idx" ON "TradingCourseModule"("completed");

-- AddForeignKey
ALTER TABLE "TradingCourse" ADD CONSTRAINT "TradingCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingCourseModule" ADD CONSTRAINT "TradingCourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "TradingCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
