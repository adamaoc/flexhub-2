-- CreateEnum
CREATE TYPE "ScdCleaningType" AS ENUM ('AIRBNB', 'AFTER_PARTY', 'OFFICE', 'REALTOR', 'OTHER');

-- CreateEnum
CREATE TYPE "ScdQuoteRequestStatus" AS ENUM ('PENDING', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "media_files" ADD COLUMN     "description" TEXT,
ADD COLUMN     "folderPath" TEXT;

-- CreateTable
CREATE TABLE "scd_quote_requests" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "cleaningType" "ScdCleaningType" NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "squareFootage" INTEGER,
    "rooms" INTEGER,
    "bathrooms" INTEGER,
    "notes" TEXT,
    "status" "ScdQuoteRequestStatus" NOT NULL DEFAULT 'PENDING',
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "confirmationNumber" TEXT,
    "quoteSent" BOOLEAN NOT NULL DEFAULT false,
    "quoteAmount" DOUBLE PRECISION,
    "quoteSentAt" TIMESTAMP(3),

    CONSTRAINT "scd_quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scd_quote_requests_confirmationNumber_key" ON "scd_quote_requests"("confirmationNumber");

-- CreateIndex
CREATE INDEX "scd_quote_requests_status_idx" ON "scd_quote_requests"("status");

-- CreateIndex
CREATE INDEX "scd_quote_requests_createdAt_idx" ON "scd_quote_requests"("createdAt");

-- CreateIndex
CREATE INDEX "scd_quote_requests_email_idx" ON "scd_quote_requests"("email");

-- CreateIndex
CREATE INDEX "scd_quote_requests_confirmationNumber_idx" ON "scd_quote_requests"("confirmationNumber");
