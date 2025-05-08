/*
  Warnings:

  - You are about to drop the column `Dias` on the `Duracao` table. All the data in the column will be lost.
  - You are about to drop the column `Preco` on the `TipoSubscricao` table. All the data in the column will be lost.
  - You are about to drop the column `Preco` on the `TipoSubscricaoDuracao` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[TipoSubscricaoID,DuracaoId]` on the table `TipoSubscricaoDuracao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Meses` to the `Duracao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Duracao" DROP COLUMN "Dias",
ADD COLUMN     "Meses" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TipoSubscricao" DROP COLUMN "Preco",
ADD COLUMN     "PrecoBaseMensal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TipoSubscricaoDuracao" DROP COLUMN "Preco",
ADD COLUMN     "Desconto" DOUBLE PRECISION,
ADD COLUMN     "ValorFinal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "TipoSubscricaoDuracao_TipoSubscricaoID_DuracaoId_key" ON "TipoSubscricaoDuracao"("TipoSubscricaoID", "DuracaoId");
