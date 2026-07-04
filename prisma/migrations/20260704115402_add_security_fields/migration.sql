-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "pin" TEXT,
ADD COLUMN     "pinUpdatedAt" TIMESTAMP(3);
