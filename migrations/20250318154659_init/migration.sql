/*
  Warnings:

  - Made the column `NIF` on table `Utilizador` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Utilizador" DROP CONSTRAINT "Utilizador_ContactoContactoId_fkey";

-- DropForeignKey
ALTER TABLE "Utilizador" DROP CONSTRAINT "Utilizador_MoradaMoradaId_fkey";

-- DropIndex
DROP INDEX "Contacto_Email_key";

-- DropIndex
DROP INDEX "Contacto_Telemovel_key";

-- DropIndex
DROP INDEX "Utilizador_ContactoContactoId_key";

-- AlterTable
ALTER TABLE "Utilizador" ALTER COLUMN "DataNascimento" DROP NOT NULL,
ALTER COLUMN "NIF" SET NOT NULL,
ALTER COLUMN "MoradaMoradaId" DROP NOT NULL,
ALTER COLUMN "ContactoContactoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_MoradaMoradaId_fkey" FOREIGN KEY ("MoradaMoradaId") REFERENCES "Morada"("MoradaId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_ContactoContactoId_fkey" FOREIGN KEY ("ContactoContactoId") REFERENCES "Contacto"("ContactoId") ON DELETE SET NULL ON UPDATE CASCADE;
