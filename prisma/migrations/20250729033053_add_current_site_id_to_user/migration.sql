-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentSiteId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentSiteId_fkey" FOREIGN KEY ("currentSiteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
