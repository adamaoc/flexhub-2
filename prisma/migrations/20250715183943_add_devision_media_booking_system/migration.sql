-- CreateEnum
CREATE TYPE "DevisionEventType" AS ENUM ('WEDDING', 'CORPORATE_EVENT', 'PORTRAIT_SESSION', 'FAMILY_SESSION', 'ENGAGEMENT', 'BIRTHDAY', 'ANNIVERSARY', 'GRADUATION', 'REAL_ESTATE', 'PRODUCT_PHOTOGRAPHY', 'EVENT_PHOTOGRAPHY', 'VIDEO_PRODUCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "DevisionReferralSource" AS ENUM ('GOOGLE_SEARCH', 'SOCIAL_MEDIA', 'FRIEND_RECOMMENDATION', 'PREVIOUS_CLIENT', 'WEDDING_VENDOR', 'BUSINESS_REFERRAL', 'YELP_REVIEW', 'FACEBOOK_ADS', 'INSTAGRAM_ADS', 'OTHER');

-- CreateEnum
CREATE TYPE "DevisionContactMethod" AS ENUM ('EMAIL', 'PHONE', 'TEXT', 'WHATSAPP', 'FACEBOOK_MESSENGER', 'INSTAGRAM_DM');

-- CreateEnum
CREATE TYPE "DevisionBookingStatus" AS ENUM ('PENDING', 'CONTACTED', 'CONFIRMED', 'DEPOSIT_PAID', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "devision_media_bookings" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventType" "DevisionEventType" NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "howDidYouHear" "DevisionReferralSource",
    "preferredContact" "DevisionContactMethod" NOT NULL,
    "status" "DevisionBookingStatus" NOT NULL DEFAULT 'PENDING',
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "confirmationNumber" TEXT,
    "notes" TEXT,
    "quoteAmount" DOUBLE PRECISION,
    "quoteSent" BOOLEAN NOT NULL DEFAULT false,
    "quoteSentAt" TIMESTAMP(3),
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "depositAmount" DOUBLE PRECISION,
    "finalPaymentPaid" BOOLEAN NOT NULL DEFAULT false,
    "finalPaymentAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devision_media_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devision_media_bookings_confirmationNumber_key" ON "devision_media_bookings"("confirmationNumber");

-- CreateIndex
CREATE INDEX "devision_media_bookings_status_idx" ON "devision_media_bookings"("status");

-- CreateIndex
CREATE INDEX "devision_media_bookings_eventDate_idx" ON "devision_media_bookings"("eventDate");

-- CreateIndex
CREATE INDEX "devision_media_bookings_email_idx" ON "devision_media_bookings"("email");

-- CreateIndex
CREATE INDEX "devision_media_bookings_confirmationNumber_idx" ON "devision_media_bookings"("confirmationNumber");

-- CreateIndex
CREATE INDEX "devision_media_bookings_createdAt_idx" ON "devision_media_bookings"("createdAt");
