/*
  Warnings:

  - You are about to drop the column `NumSocio` on the `Utilizador` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[NumMembro]` on the table `Utilizador` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Utilizador_NumSocio_key";

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "Nota" TEXT;

-- AlterTable
ALTER TABLE "Subscricao" ADD COLUMN     "DuracaoId" INTEGER;

-- AlterTable
ALTER TABLE "TipoSubscricao" ADD COLUMN     "Nome" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "Descricao" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Utilizador" DROP COLUMN "NumSocio",
ADD COLUMN     "NumMembro" INTEGER;

-- CreateTable
CREATE TABLE "Duracao" (
    "DuracaoId" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,
    "Dias" INTEGER NOT NULL,

    CONSTRAINT "Duracao_pkey" PRIMARY KEY ("DuracaoId")
);

-- CreateTable
CREATE TABLE "TipoSubscricaoDuracao" (
    "TipoSubscricaoDuracaoId" SERIAL NOT NULL,
    "TipoSubscricaoID" INTEGER NOT NULL,
    "DuracaoId" INTEGER NOT NULL,
    "Preco" INTEGER NOT NULL,

    CONSTRAINT "TipoSubscricaoDuracao_pkey" PRIMARY KEY ("TipoSubscricaoDuracaoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_NumMembro_key" ON "Utilizador"("NumMembro");

-- AddForeignKey
ALTER TABLE "TipoSubscricaoDuracao" ADD CONSTRAINT "TipoSubscricaoDuracao_TipoSubscricaoID_fkey" FOREIGN KEY ("TipoSubscricaoID") REFERENCES "TipoSubscricao"("TipoSubscricaoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoSubscricaoDuracao" ADD CONSTRAINT "TipoSubscricaoDuracao_DuracaoId_fkey" FOREIGN KEY ("DuracaoId") REFERENCES "Duracao"("DuracaoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_DuracaoId_fkey" FOREIGN KEY ("DuracaoId") REFERENCES "Duracao"("DuracaoId") ON DELETE SET NULL ON UPDATE CASCADE;
