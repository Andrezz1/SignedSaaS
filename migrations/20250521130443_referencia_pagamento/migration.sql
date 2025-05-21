/*
  Warnings:

  - A unique constraint covering the columns `[referencia]` on the table `Pagamento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "referencia" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_referencia_key" ON "Pagamento"("referencia");
