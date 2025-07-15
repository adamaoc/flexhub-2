/*
  Warnings:

  - The primary key for the `devision_media_featured_work` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `devision_media_featured_work` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "devision_media_featured_work" DROP CONSTRAINT "devision_media_featured_work_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "devision_media_featured_work_pkey" PRIMARY KEY ("id");
