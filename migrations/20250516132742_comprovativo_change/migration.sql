-- DropForeignKey
ALTER TABLE "Comprovativo" DROP CONSTRAINT "Comprovativo_SubscricaoSubscricaoId_fkey";

-- AlterTable
ALTER TABLE "Comprovativo" ALTER COLUMN "SubscricaoSubscricaoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Comprovativo" ADD CONSTRAINT "Comprovativo_SubscricaoSubscricaoId_fkey" FOREIGN KEY ("SubscricaoSubscricaoId") REFERENCES "Subscricao"("SubscricaoId") ON DELETE SET NULL ON UPDATE CASCADE;
