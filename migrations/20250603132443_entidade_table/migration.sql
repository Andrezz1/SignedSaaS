/*
  Warnings:

  - You are about to drop the column `Entidade` on the `AuditPagamento` table. All the data in the column will be lost.
  - You are about to drop the column `Entidade` on the `AuditTipoSubscricao` table. All the data in the column will be lost.
  - You are about to drop the column `Entidade` on the `AuditUtilizador` table. All the data in the column will be lost.
  - You are about to drop the column `PrecoBaseMensal` on the `TipoSubscricao` table. All the data in the column will be lost.
  - You are about to drop the column `Desconto` on the `TipoSubscricaoDuracao` table. All the data in the column will be lost.
  - You are about to drop the column `ValorFinal` on the `TipoSubscricaoDuracao` table. All the data in the column will be lost.
  - Added the required column `EntidadeId` to the `AuditPagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntidadeId` to the `AuditTipoSubscricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntidadeId` to the `AuditUtilizador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntidadeId` to the `Doacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntidadeId` to the `Pagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntidadeId` to the `Subscricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntidadeId` to the `TipoSubscricao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EntidadeId` to the `Utilizador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditPagamento" DROP COLUMN "Entidade",
ADD COLUMN     "EntidadeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AuditTipoSubscricao" DROP COLUMN "Entidade",
ADD COLUMN     "EntidadeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AuditUtilizador" DROP COLUMN "Entidade",
ADD COLUMN     "EntidadeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Doacao" ADD COLUMN     "EntidadeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "EntidadeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subscricao" ADD COLUMN     "EntidadeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TipoSubscricao" DROP COLUMN "PrecoBaseMensal",
ADD COLUMN     "EntidadeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TipoSubscricaoDuracao" DROP COLUMN "Desconto",
DROP COLUMN "ValorFinal",
ADD COLUMN     "Valor" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Utilizador" ADD COLUMN     "EntidadeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Entidade" (
    "EntidadeId" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,

    CONSTRAINT "Entidade_pkey" PRIMARY KEY ("EntidadeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entidade_Nome_key" ON "Entidade"("Nome");

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_EntidadeId_fkey" FOREIGN KEY ("EntidadeId") REFERENCES "Entidade"("EntidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditPagamento" ADD CONSTRAINT "AuditPagamento_EntidadeId_fkey" FOREIGN KEY ("EntidadeId") REFERENCES "Entidade"("EntidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTipoSubscricao" ADD CONSTRAINT "AuditTipoSubscricao_EntidadeId_fkey" FOREIGN KEY ("EntidadeId") REFERENCES "Entidade"("EntidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditUtilizador" ADD CONSTRAINT "AuditUtilizador_EntidadeId_fkey" FOREIGN KEY ("EntidadeId") REFERENCES "Entidade"("EntidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_EntidadeId_fkey" FOREIGN KEY ("EntidadeId") REFERENCES "Entidade"("EntidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_EntidadeId_fkey" FOREIGN KEY ("EntidadeId") REFERENCES "Entidade"("EntidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_EntidadeId_fkey" FOREIGN KEY ("EntidadeId") REFERENCES "Entidade"("EntidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoSubscricao" ADD CONSTRAINT "TipoSubscricao_EntidadeId_fkey" FOREIGN KEY ("EntidadeId") REFERENCES "Entidade"("EntidadeId") ON DELETE RESTRICT ON UPDATE CASCADE;
