/*
  Warnings:

  - You are about to drop the column `PalavraPasse` on the `Utilizador` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilizador" DROP COLUMN "PalavraPasse",
ADD COLUMN     "Imagem" TEXT;
