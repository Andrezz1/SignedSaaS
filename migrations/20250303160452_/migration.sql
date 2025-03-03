/*
  Warnings:

  - You are about to drop the `CodigoPostal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comprovativo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Contacto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DetalheSubscricao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Doacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Morada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pagamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscricao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipoSubscricao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipoUtilizador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Utilizador` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comprovativo" DROP CONSTRAINT "Comprovativo_PagamentoPagamentoId_fkey";

-- DropForeignKey
ALTER TABLE "Comprovativo" DROP CONSTRAINT "Comprovativo_SubscricaoSubscricaoId_fkey";

-- DropForeignKey
ALTER TABLE "Comprovativo" DROP CONSTRAINT "Comprovativo_UtilizadorUtilizadorId_fkey";

-- DropForeignKey
ALTER TABLE "DetalheSubscricao" DROP CONSTRAINT "DetalheSubscricao_SubscricaoSubscricaoId_fkey";

-- DropForeignKey
ALTER TABLE "DetalheSubscricao" DROP CONSTRAINT "DetalheSubscricao_TipoSubscricaoTipoSubscricaoID_fkey";

-- DropForeignKey
ALTER TABLE "Doacao" DROP CONSTRAINT "Doacao_UtilizadorUtilizadorId_fkey";

-- DropForeignKey
ALTER TABLE "Morada" DROP CONSTRAINT "Morada_CodigoPostalCodigoPostalId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_UtilizadorUtilizadorId_fkey";

-- DropForeignKey
ALTER TABLE "Subscricao" DROP CONSTRAINT "Subscricao_PagamentoPagamentoId_fkey";

-- DropForeignKey
ALTER TABLE "Subscricao" DROP CONSTRAINT "Subscricao_TipoSubscricaoTipoSubscricaoID_fkey";

-- DropForeignKey
ALTER TABLE "Subscricao" DROP CONSTRAINT "Subscricao_UtilizadorUtilizadorId_fkey";

-- DropForeignKey
ALTER TABLE "Utilizador" DROP CONSTRAINT "Utilizador_ContactoContactoId_fkey";

-- DropForeignKey
ALTER TABLE "Utilizador" DROP CONSTRAINT "Utilizador_MoradaMoradaId_fkey";

-- DropForeignKey
ALTER TABLE "Utilizador" DROP CONSTRAINT "Utilizador_TipoUtilizadorTipoUtilizadorId_fkey";

-- DropTable
DROP TABLE "CodigoPostal";

-- DropTable
DROP TABLE "Comprovativo";

-- DropTable
DROP TABLE "Contacto";

-- DropTable
DROP TABLE "DetalheSubscricao";

-- DropTable
DROP TABLE "Doacao";

-- DropTable
DROP TABLE "Morada";

-- DropTable
DROP TABLE "Pagamento";

-- DropTable
DROP TABLE "Subscricao";

-- DropTable
DROP TABLE "TipoSubscricao";

-- DropTable
DROP TABLE "TipoUtilizador";

-- DropTable
DROP TABLE "Utilizador";

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);
