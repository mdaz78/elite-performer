-- Update HabitFrequency enum: remove monthly, add custom
ALTER TYPE "HabitFrequency" RENAME TO "HabitFrequency_old";
CREATE TYPE "HabitFrequency" AS ENUM ('daily', 'weekly', 'custom');
ALTER TABLE "Habit" ALTER COLUMN "frequency" TYPE "HabitFrequency" USING "frequency"::text::"HabitFrequency";
DROP TYPE "HabitFrequency_old";

-- Rename frequencyDays to customDays
ALTER TABLE "Habit" RENAME COLUMN "frequencyDays" TO "customDays";

-- Remove frequencyInterval column
ALTER TABLE "Habit" DROP COLUMN IF EXISTS "frequencyInterval";

-- Remove goalId column and foreign key
ALTER TABLE "Habit" DROP CONSTRAINT IF EXISTS "Habit_goalId_fkey";
ALTER TABLE "Habit" DROP COLUMN IF EXISTS "goalId";
DROP INDEX IF EXISTS "Habit_goalId_idx";

-- Make startDate nullable
ALTER TABLE "Habit" ALTER COLUMN "startDate" DROP NOT NULL;

-- Drop old HabitLog table
DROP TABLE IF EXISTS "HabitLog";

-- Create HabitCompletion table
CREATE TABLE "HabitCompletion" (
    "id" SERIAL NOT NULL,
    "habitId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitCompletion_pkey" PRIMARY KEY ("id")
);

-- Create SubHabitCompletion table
CREATE TABLE "SubHabitCompletion" (
    "id" SERIAL NOT NULL,
    "subHabitId" INTEGER NOT NULL,
    "habitId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubHabitCompletion_pkey" PRIMARY KEY ("id")
);

-- Create indexes for HabitCompletion
CREATE INDEX "HabitCompletion_userId_idx" ON "HabitCompletion"("userId");
CREATE INDEX "HabitCompletion_habitId_idx" ON "HabitCompletion"("habitId");
CREATE INDEX "HabitCompletion_date_idx" ON "HabitCompletion"("date");
CREATE INDEX "HabitCompletion_completed_idx" ON "HabitCompletion"("completed");
CREATE UNIQUE INDEX "HabitCompletion_userId_habitId_date_key" ON "HabitCompletion"("userId", "habitId", "date");

-- Create indexes for SubHabitCompletion
CREATE INDEX "SubHabitCompletion_userId_idx" ON "SubHabitCompletion"("userId");
CREATE INDEX "SubHabitCompletion_subHabitId_idx" ON "SubHabitCompletion"("subHabitId");
CREATE INDEX "SubHabitCompletion_habitId_idx" ON "SubHabitCompletion"("habitId");
CREATE INDEX "SubHabitCompletion_date_idx" ON "SubHabitCompletion"("date");
CREATE INDEX "SubHabitCompletion_completed_idx" ON "SubHabitCompletion"("completed");
CREATE UNIQUE INDEX "SubHabitCompletion_userId_subHabitId_date_key" ON "SubHabitCompletion"("userId", "subHabitId", "date");

-- Add foreign keys
ALTER TABLE "HabitCompletion" ADD CONSTRAINT "HabitCompletion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HabitCompletion" ADD CONSTRAINT "HabitCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubHabitCompletion" ADD CONSTRAINT "SubHabitCompletion_subHabitId_fkey" FOREIGN KEY ("subHabitId") REFERENCES "SubHabit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubHabitCompletion" ADD CONSTRAINT "SubHabitCompletion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubHabitCompletion" ADD CONSTRAINT "SubHabitCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add createdAt index to Habit
CREATE INDEX IF NOT EXISTS "Habit_createdAt_idx" ON "Habit"("createdAt");
