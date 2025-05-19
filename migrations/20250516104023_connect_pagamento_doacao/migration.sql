/*
  Warnings:

  - A unique constraint covering the columns `[DoacaoId]` on the table `Pagamento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "DoacaoId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_DoacaoId_key" ON "Pagamento"("DoacaoId");

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_DoacaoId_fkey" FOREIGN KEY ("DoacaoId") REFERENCES "Doacao"("DoacaoId") ON DELETE SET NULL ON UPDATE CASCADE;
