/*
  Warnings:

  - Added the required column `Entidade` to the `AuditPagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Entidade` to the `AuditTipoSubscricao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditPagamento" ADD COLUMN     "Entidade" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AuditTipoSubscricao" ADD COLUMN     "Entidade" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AuditUtilizador" ADD COLUMN     "Entidade" TEXT;
