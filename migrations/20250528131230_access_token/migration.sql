-- CreateTable
CREATE TABLE "AccessToken" (
    "TokenId" SERIAL NOT NULL,
    "Token" TEXT NOT NULL,
    "UtilizadorId" INTEGER NOT NULL,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("TokenId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_Token_key" ON "AccessToken"("Token");

-- AddForeignKey
ALTER TABLE "AccessToken" ADD CONSTRAINT "AccessToken_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
