/*
  Warnings:

  - A unique constraint covering the columns `[Telemovel]` on the table `Contacto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contacto_Telemovel_key" ON "Contacto"("Telemovel");
