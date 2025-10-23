-- CreateEnum
CREATE TYPE "public"."AccommodationType" AS ENUM ('PRIVATE_ROOM', 'SHARED_ROOM', 'COUCH', 'ENTIRE_PLACE');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('MONEY', 'SKILL_TRADE', 'TREAT_ME', 'BERSE_POINTS', 'FREE', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "public"."GuideType" AS ENUM ('FOOD_TOUR', 'CULTURAL_TOUR', 'NIGHTLIFE', 'HIKING', 'CYCLING', 'PHOTOGRAPHY', 'SHOPPING', 'LOCAL_EXPERIENCE', 'HISTORICAL_SITES', 'NATURE_WALKS', 'BAR_HOPPING', 'COFFEE_CRAWL', 'STREET_ART', 'HIDDEN_GEMS', 'FAMILY_FRIENDLY', 'ADVENTURE_SPORTS');

-- CreateEnum
CREATE TYPE "public"."HomeSurfBookingStatus" AS ENUM ('PENDING', 'DISCUSSING', 'APPROVED', 'REJECTED', 'CANCELLED_BY_GUEST', 'CANCELLED_BY_HOST', 'CHECKED_IN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."BerseGuideBookingStatus" AS ENUM ('PENDING', 'DISCUSSING', 'APPROVED', 'REJECTED', 'CANCELLED_BY_TRAVELER', 'CANCELLED_BY_GUIDE', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."ReviewerRole" AS ENUM ('HOST', 'GUEST', 'GUIDE', 'TRAVELER');

-- CreateTable
CREATE TABLE "public"."user_homesurf" (
    "userId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accommodationType" "public"."AccommodationType" NOT NULL,
    "maxGuests" INTEGER NOT NULL DEFAULT 1,
    "amenities" TEXT[],
    "houseRules" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availabilityNotes" TEXT,
    "minimumStay" INTEGER,
    "maximumStay" INTEGER,
    "advanceNotice" INTEGER,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT,
    "address" JSONB,
    "coordinates" JSONB,
    "responseRate" DOUBLE PRECISION DEFAULT 0,
    "averageResponseTime" INTEGER,
    "totalGuests" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_homesurf_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."homesurf_payment_options" (
    "id" TEXT NOT NULL,
    "homeSurfId" TEXT NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "description" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "homesurf_payment_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."homesurf_bookings" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "numberOfGuests" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT,
    "status" "public"."HomeSurfBookingStatus" NOT NULL DEFAULT 'PENDING',
    "agreedPaymentType" "public"."PaymentType",
    "agreedPaymentAmount" DOUBLE PRECISION,
    "agreedPaymentDetails" TEXT,
    "specialRequests" TEXT,
    "checkInInstructions" TEXT,
    "conversationId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "checkedInAt" TIMESTAMP(3),
    "checkedOutAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,

    CONSTRAINT "homesurf_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."homesurf_reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "reviewerRole" "public"."ReviewerRole" NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "cleanliness" INTEGER,
    "communication" INTEGER,
    "location" INTEGER,
    "hospitality" INTEGER,
    "respect" INTEGER,
    "wouldHostAgain" BOOLEAN,
    "wouldStayAgain" BOOLEAN,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homesurf_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_berseguide" (
    "userId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tagline" TEXT,
    "guideTypes" "public"."GuideType"[],
    "customTypes" TEXT[],
    "languages" TEXT[],
    "city" TEXT NOT NULL,
    "neighborhoods" TEXT[],
    "coverageRadius" INTEGER,
    "availabilityNotes" TEXT,
    "typicalDuration" INTEGER,
    "minDuration" INTEGER,
    "maxDuration" INTEGER,
    "maxGroupSize" INTEGER NOT NULL DEFAULT 1,
    "advanceNotice" INTEGER,
    "yearsGuiding" INTEGER,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "highlights" TEXT[],
    "sampleItinerary" TEXT,
    "responseRate" DOUBLE PRECISION DEFAULT 0,
    "averageResponseTime" INTEGER,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_berseguide_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."berseguide_payment_options" (
    "id" TEXT NOT NULL,
    "berseGuideId" TEXT NOT NULL,
    "paymentType" "public"."PaymentType" NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'USD',
    "description" TEXT,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "berseguide_payment_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."berseguide_bookings" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3),
    "alternativeDates" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
    "preferredTime" TEXT,
    "duration" INTEGER,
    "numberOfPeople" INTEGER NOT NULL DEFAULT 1,
    "interests" TEXT[],
    "specificRequests" TEXT,
    "message" TEXT,
    "status" "public"."BerseGuideBookingStatus" NOT NULL DEFAULT 'PENDING',
    "agreedDate" TIMESTAMP(3),
    "agreedTime" TEXT,
    "agreedDuration" INTEGER,
    "agreedPaymentType" "public"."PaymentType",
    "agreedPaymentAmount" DOUBLE PRECISION,
    "agreedPaymentDetails" TEXT,
    "meetingPoint" TEXT,
    "itinerary" TEXT,
    "conversationId" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,

    CONSTRAINT "berseguide_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."berseguide_sessions" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "actualDuration" INTEGER,
    "locationsCovered" TEXT[],
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "paymentType" "public"."PaymentType",
    "paymentAmount" DOUBLE PRECISION,
    "paymentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "berseguide_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."berseguide_reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "knowledge" INTEGER,
    "communication" INTEGER,
    "friendliness" INTEGER,
    "value" INTEGER,
    "wouldRecommend" BOOLEAN,
    "highlights" TEXT[],
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "berseguide_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_homesurf_isEnabled_city_idx" ON "public"."user_homesurf"("isEnabled", "city");

-- CreateIndex
CREATE INDEX "user_homesurf_city_isEnabled_idx" ON "public"."user_homesurf"("city", "isEnabled");

-- CreateIndex
CREATE INDEX "homesurf_payment_options_homeSurfId_idx" ON "public"."homesurf_payment_options"("homeSurfId");

-- CreateIndex
CREATE INDEX "homesurf_bookings_hostId_status_idx" ON "public"."homesurf_bookings"("hostId", "status");

-- CreateIndex
CREATE INDEX "homesurf_bookings_guestId_status_idx" ON "public"."homesurf_bookings"("guestId", "status");

-- CreateIndex
CREATE INDEX "homesurf_bookings_checkInDate_idx" ON "public"."homesurf_bookings"("checkInDate");

-- CreateIndex
CREATE INDEX "homesurf_bookings_status_idx" ON "public"."homesurf_bookings"("status");

-- CreateIndex
CREATE INDEX "homesurf_reviews_revieweeId_idx" ON "public"."homesurf_reviews"("revieweeId");

-- CreateIndex
CREATE INDEX "homesurf_reviews_reviewerId_idx" ON "public"."homesurf_reviews"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "homesurf_reviews_bookingId_reviewerId_key" ON "public"."homesurf_reviews"("bookingId", "reviewerId");

-- CreateIndex
CREATE INDEX "user_berseguide_isEnabled_city_idx" ON "public"."user_berseguide"("isEnabled", "city");

-- CreateIndex
CREATE INDEX "user_berseguide_city_isEnabled_idx" ON "public"."user_berseguide"("city", "isEnabled");

-- CreateIndex
CREATE INDEX "berseguide_payment_options_berseGuideId_idx" ON "public"."berseguide_payment_options"("berseGuideId");

-- CreateIndex
CREATE INDEX "berseguide_bookings_guideId_status_idx" ON "public"."berseguide_bookings"("guideId", "status");

-- CreateIndex
CREATE INDEX "berseguide_bookings_travelerId_status_idx" ON "public"."berseguide_bookings"("travelerId", "status");

-- CreateIndex
CREATE INDEX "berseguide_bookings_agreedDate_idx" ON "public"."berseguide_bookings"("agreedDate");

-- CreateIndex
CREATE INDEX "berseguide_bookings_status_idx" ON "public"."berseguide_bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "berseguide_sessions_bookingId_key" ON "public"."berseguide_sessions"("bookingId");

-- CreateIndex
CREATE INDEX "berseguide_sessions_guideId_idx" ON "public"."berseguide_sessions"("guideId");

-- CreateIndex
CREATE INDEX "berseguide_sessions_date_idx" ON "public"."berseguide_sessions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "berseguide_reviews_bookingId_key" ON "public"."berseguide_reviews"("bookingId");

-- CreateIndex
CREATE INDEX "berseguide_reviews_guideId_idx" ON "public"."berseguide_reviews"("guideId");

-- CreateIndex
CREATE INDEX "berseguide_reviews_rating_idx" ON "public"."berseguide_reviews"("rating");

-- AddForeignKey
ALTER TABLE "public"."user_homesurf" ADD CONSTRAINT "user_homesurf_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homesurf_payment_options" ADD CONSTRAINT "homesurf_payment_options_homeSurfId_fkey" FOREIGN KEY ("homeSurfId") REFERENCES "public"."user_homesurf"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homesurf_bookings" ADD CONSTRAINT "homesurf_bookings_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homesurf_bookings" ADD CONSTRAINT "homesurf_bookings_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homesurf_bookings" ADD CONSTRAINT "homesurf_booking_homesurf_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."user_homesurf"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homesurf_reviews" ADD CONSTRAINT "homesurf_reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."homesurf_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homesurf_reviews" ADD CONSTRAINT "homesurf_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homesurf_reviews" ADD CONSTRAINT "homesurf_reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."homesurf_reviews" ADD CONSTRAINT "homesurf_review_homesurf_fkey" FOREIGN KEY ("revieweeId") REFERENCES "public"."user_homesurf"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_berseguide" ADD CONSTRAINT "user_berseguide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_payment_options" ADD CONSTRAINT "berseguide_payment_options_berseGuideId_fkey" FOREIGN KEY ("berseGuideId") REFERENCES "public"."user_berseguide"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_bookings" ADD CONSTRAINT "berseguide_bookings_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_bookings" ADD CONSTRAINT "berseguide_bookings_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_bookings" ADD CONSTRAINT "berseguide_booking_guide_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."user_berseguide"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_sessions" ADD CONSTRAINT "berseguide_sessions_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."berseguide_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_sessions" ADD CONSTRAINT "berseguide_sessions_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_sessions" ADD CONSTRAINT "berseguide_sessions_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_sessions" ADD CONSTRAINT "berseguide_session_guide_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."user_berseguide"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_reviews" ADD CONSTRAINT "berseguide_reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."berseguide_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_reviews" ADD CONSTRAINT "berseguide_reviews_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_reviews" ADD CONSTRAINT "berseguide_reviews_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."berseguide_reviews" ADD CONSTRAINT "berseguide_review_guide_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."user_berseguide"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
