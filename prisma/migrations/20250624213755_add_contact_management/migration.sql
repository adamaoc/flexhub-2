-- CreateEnum
CREATE TYPE "ContactFormFieldType" AS ENUM ('TEXT', 'EMAIL', 'PHONE', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO', 'NUMBER', 'URL');

-- CreateTable
CREATE TABLE "contact_forms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Contact Form',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "siteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_form_fields" (
    "id" TEXT NOT NULL,
    "contactFormId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "fieldType" "ContactFormFieldType" NOT NULL DEFAULT 'TEXT',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "helpText" TEXT,
    "options" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "contactFormId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "submitterIp" TEXT,
    "submitterUserAgent" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submission_data" (
    "id" TEXT NOT NULL,
    "contactSubmissionId" TEXT NOT NULL,
    "contactFormFieldId" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_submission_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_forms_siteId_key" ON "contact_forms"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_form_fields_contactFormId_fieldName_key" ON "contact_form_fields"("contactFormId", "fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "contact_submission_data_contactSubmissionId_contactFormFiel_key" ON "contact_submission_data"("contactSubmissionId", "contactFormFieldId");

-- AddForeignKey
ALTER TABLE "contact_forms" ADD CONSTRAINT "contact_forms_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_form_fields" ADD CONSTRAINT "contact_form_fields_contactFormId_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_contactFormId_fkey" FOREIGN KEY ("contactFormId") REFERENCES "contact_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submission_data" ADD CONSTRAINT "contact_submission_data_contactSubmissionId_fkey" FOREIGN KEY ("contactSubmissionId") REFERENCES "contact_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_submission_data" ADD CONSTRAINT "contact_submission_data_contactFormFieldId_fkey" FOREIGN KEY ("contactFormFieldId") REFERENCES "contact_form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
