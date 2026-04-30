/*
  Warnings:

  - You are about to drop the column `polarCustomerId` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the `subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."subscription" DROP CONSTRAINT "subscription_organizationId_fkey";

-- AlterTable
ALTER TABLE "public"."organization" DROP COLUMN "polarCustomerId";

-- DropTable
DROP TABLE "public"."subscription";
