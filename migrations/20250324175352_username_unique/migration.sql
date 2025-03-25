/*
  Warnings:

  - A unique constraint covering the columns `[Username]` on the table `Utilizador` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_Username_key" ON "Utilizador"("Username");
