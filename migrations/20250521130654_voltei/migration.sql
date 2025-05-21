/*
  Warnings:

  - You are about to drop the column `referencia` on the `Pagamento` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Pagamento_referencia_key";

-- AlterTable
ALTER TABLE "Pagamento" DROP COLUMN "referencia";
