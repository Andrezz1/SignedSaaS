/*
  Warnings:

  - A unique constraint covering the columns `[NumSocio]` on the table `Utilizador` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Utilizador" ADD COLUMN     "NumSocio" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_NumSocio_key" ON "Utilizador"("NumSocio");
