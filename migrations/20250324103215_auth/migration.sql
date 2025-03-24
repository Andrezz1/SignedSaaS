/*
  Warnings:

  - You are about to drop the column `UtilizadorUtilizadorId` on the `Comprovativo` table. All the data in the column will be lost.
  - You are about to drop the column `UtilizadorUtilizadorId` on the `Doacao` table. All the data in the column will be lost.
  - You are about to drop the column `UtilizadorUtilizadorId` on the `Pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `UtilizadorUtilizadorId` on the `Subscricao` table. All the data in the column will be lost.
  - The primary key for the `Utilizador` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `UtilizadorId` on the `Utilizador` table. All the data in the column will be lost.
  - Added the required column `UtilizadorId` to the `Comprovativo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UtilizadorId` to the `Doacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UtilizadorId` to the `Pagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UtilizadorId` to the `Subscricao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comprovativo" DROP CONSTRAINT "Comprovativo_UtilizadorUtilizadorId_fkey";

-- DropForeignKey
ALTER TABLE "Doacao" DROP CONSTRAINT "Doacao_UtilizadorUtilizadorId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_UtilizadorUtilizadorId_fkey";

-- DropForeignKey
ALTER TABLE "Subscricao" DROP CONSTRAINT "Subscricao_UtilizadorUtilizadorId_fkey";

-- AlterTable
ALTER TABLE "Comprovativo" DROP COLUMN "UtilizadorUtilizadorId",
ADD COLUMN     "UtilizadorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Doacao" DROP COLUMN "UtilizadorUtilizadorId",
ADD COLUMN     "UtilizadorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Pagamento" DROP COLUMN "UtilizadorUtilizadorId",
ADD COLUMN     "UtilizadorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subscricao" DROP COLUMN "UtilizadorUtilizadorId",
ADD COLUMN     "UtilizadorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Utilizador" DROP CONSTRAINT "Utilizador_pkey",
DROP COLUMN "UtilizadorId",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "Nome" DROP NOT NULL,
ALTER COLUMN "NIF" DROP NOT NULL,
ADD CONSTRAINT "Utilizador_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Comprovativo" ADD CONSTRAINT "Comprovativo_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
