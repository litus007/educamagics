-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARENT', 'CHILD', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubjectArea" AS ENUM ('MATH', 'LANGUAGE', 'ENGLISH', 'SCIENCE', 'HISTORY', 'MUSIC', 'ART', 'OTHER');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_REQUEST', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'CLASS_REMINDER', 'CLASS_STARTED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('NUMBER_SERIES', 'VISUAL_PATTERN', 'WORD_PUZZLE', 'MATH_SPEED', 'ODD_ONE_OUT');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PARENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "avatarKey" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "parentId" TEXT NOT NULL,
    "childProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hourlyRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSubject" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subject" "SubjectArea" NOT NULL,
    "level" TEXT,

    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "livekitRoom" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationMins" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "toUserId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "title" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "pointsBase" INTEGER NOT NULL DEFAULT 100,
    "timeLimit" INTEGER NOT NULL DEFAULT 30,
    "isDaily" BOOLEAN NOT NULL DEFAULT false,
    "activeDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpentMs" INTEGER NOT NULL,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "pointsBreakdown" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalRanking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarKey" TEXT NOT NULL DEFAULT 'star',
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "weeklyPoints" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "ParentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChildProfile_userId_key" ON "ChildProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Child_parentId_childProfileId_key" ON "Child"("parentId", "childProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubject_teacherId_subject_level_key" ON "TeacherSubject"("teacherId", "subject", "level");

-- CreateIndex
CREATE INDEX "TimeSlot_teacherId_dayOfWeek_idx" ON "TimeSlot"("teacherId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Booking_childId_status_idx" ON "Booking"("childId", "status");

-- CreateIndex
CREATE INDEX "Booking_timeSlotId_date_idx" ON "Booking"("timeSlotId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_bookingId_key" ON "ClassSession"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_livekitRoom_key" ON "ClassSession"("livekitRoom");

-- CreateIndex
CREATE INDEX "ClassSession_teacherId_status_idx" ON "ClassSession"("teacherId", "status");

-- CreateIndex
CREATE INDEX "Notification_status_createdAt_idx" ON "Notification"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_toUserId_idx" ON "Notification"("toUserId");

-- CreateIndex
CREATE INDEX "Activity_isDaily_activeDate_idx" ON "Activity"("isDaily", "activeDate");

-- CreateIndex
CREATE INDEX "Activity_difficulty_type_idx" ON "Activity"("difficulty", "type");

-- CreateIndex
CREATE INDEX "Attempt_userId_createdAt_idx" ON "Attempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Attempt_activityId_isCorrect_idx" ON "Attempt"("activityId", "isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_activityId_userId_key" ON "Attempt"("activityId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GlobalRanking_userId_key" ON "GlobalRanking"("userId");

-- CreateIndex
CREATE INDEX "GlobalRanking_totalPoints_idx" ON "GlobalRanking"("totalPoints" DESC);

-- CreateIndex
CREATE INDEX "GlobalRanking_weeklyPoints_idx" ON "GlobalRanking"("weeklyPoints" DESC);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildProfile" ADD CONSTRAINT "ChildProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GlobalRanking" ADD CONSTRAINT "GlobalRanking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
