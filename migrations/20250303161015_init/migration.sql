/*
  Warnings:

  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Task";

-- CreateTable
CREATE TABLE "CodigoPostal" (
    "CodigoPostalId" SERIAL NOT NULL,
    "Localidade" TEXT NOT NULL,

    CONSTRAINT "CodigoPostal_pkey" PRIMARY KEY ("CodigoPostalId")
);

-- CreateTable
CREATE TABLE "Comprovativo" (
    "ComprovativoId" SERIAL NOT NULL,
    "PagamentoPagamentoId" INTEGER NOT NULL,
    "SubscricaoSubscricaoId" INTEGER NOT NULL,
    "UtilizadorUtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "Comprovativo_pkey" PRIMARY KEY ("ComprovativoId")
);

-- CreateTable
CREATE TABLE "Contacto" (
    "ContactoId" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "Telemovel" TEXT NOT NULL,

    CONSTRAINT "Contacto_pkey" PRIMARY KEY ("ContactoId")
);

-- CreateTable
CREATE TABLE "DetalheSubscricao" (
    "DetalheSubscricaoId" SERIAL NOT NULL,
    "Quantidade" INTEGER NOT NULL,
    "Desconto" DOUBLE PRECISION,
    "ValorFinal" INTEGER NOT NULL,
    "SubscricaoSubscricaoId" INTEGER NOT NULL,
    "TipoSubscricaoTipoSubscricaoID" INTEGER NOT NULL,

    CONSTRAINT "DetalheSubscricao_pkey" PRIMARY KEY ("DetalheSubscricaoId")
);

-- CreateTable
CREATE TABLE "Doacao" (
    "DoacaoId" SERIAL NOT NULL,
    "ValorDoacao" INTEGER NOT NULL,
    "DataDoacao" TIMESTAMP(3) NOT NULL,
    "Nota" TEXT NOT NULL,
    "UtilizadorUtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "Doacao_pkey" PRIMARY KEY ("DoacaoId")
);

-- CreateTable
CREATE TABLE "Morada" (
    "MoradaId" SERIAL NOT NULL,
    "Concelho" TEXT NOT NULL,
    "Distrito" TEXT NOT NULL,
    "CodigoPostalCodigoPostalId" INTEGER NOT NULL,

    CONSTRAINT "Morada_pkey" PRIMARY KEY ("MoradaId")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "PagamentoId" SERIAL NOT NULL,
    "Valor" INTEGER NOT NULL,
    "DataPagamento" TIMESTAMP(3) NOT NULL,
    "EstadoPagamento" TEXT NOT NULL,
    "NIFPagamento" INTEGER NOT NULL,
    "UtilizadorUtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("PagamentoId")
);

-- CreateTable
CREATE TABLE "Subscricao" (
    "SubscricaoId" SERIAL NOT NULL,
    "DataInicio" TIMESTAMP(3) NOT NULL,
    "DataFim" TIMESTAMP(3) NOT NULL,
    "EstadoSubscricao" BOOLEAN NOT NULL,
    "UtilizadorUtilizadorId" INTEGER NOT NULL,
    "PagamentoPagamentoId" INTEGER NOT NULL,
    "TipoSubscricaoTipoSubscricaoID" INTEGER NOT NULL,

    CONSTRAINT "Subscricao_pkey" PRIMARY KEY ("SubscricaoId")
);

-- CreateTable
CREATE TABLE "TipoSubscricao" (
    "TipoSubscricaoID" SERIAL NOT NULL,
    "Descricao" TEXT NOT NULL,
    "Preco" INTEGER NOT NULL,

    CONSTRAINT "TipoSubscricao_pkey" PRIMARY KEY ("TipoSubscricaoID")
);

-- CreateTable
CREATE TABLE "TipoUtilizador" (
    "TipoUtilizadorId" SERIAL NOT NULL,
    "Descricao" TEXT NOT NULL,

    CONSTRAINT "TipoUtilizador_pkey" PRIMARY KEY ("TipoUtilizadorId")
);

-- CreateTable
CREATE TABLE "Utilizador" (
    "UtilizadorId" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,
    "DataNascimento" TIMESTAMP(3) NOT NULL,
    "NIF" TEXT NOT NULL,
    "PalavraPasse" TEXT NOT NULL,
    "MoradaMoradaId" INTEGER NOT NULL,
    "ContactoContactoId" INTEGER NOT NULL,
    "TipoUtilizadorTipoUtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "Utilizador_pkey" PRIMARY KEY ("UtilizadorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contacto_Email_key" ON "Contacto"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_NIF_key" ON "Utilizador"("NIF");

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_ContactoContactoId_key" ON "Utilizador"("ContactoContactoId");

-- AddForeignKey
ALTER TABLE "Comprovativo" ADD CONSTRAINT "Comprovativo_PagamentoPagamentoId_fkey" FOREIGN KEY ("PagamentoPagamentoId") REFERENCES "Pagamento"("PagamentoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprovativo" ADD CONSTRAINT "Comprovativo_SubscricaoSubscricaoId_fkey" FOREIGN KEY ("SubscricaoSubscricaoId") REFERENCES "Subscricao"("SubscricaoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprovativo" ADD CONSTRAINT "Comprovativo_UtilizadorUtilizadorId_fkey" FOREIGN KEY ("UtilizadorUtilizadorId") REFERENCES "Utilizador"("UtilizadorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalheSubscricao" ADD CONSTRAINT "DetalheSubscricao_SubscricaoSubscricaoId_fkey" FOREIGN KEY ("SubscricaoSubscricaoId") REFERENCES "Subscricao"("SubscricaoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalheSubscricao" ADD CONSTRAINT "DetalheSubscricao_TipoSubscricaoTipoSubscricaoID_fkey" FOREIGN KEY ("TipoSubscricaoTipoSubscricaoID") REFERENCES "TipoSubscricao"("TipoSubscricaoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_UtilizadorUtilizadorId_fkey" FOREIGN KEY ("UtilizadorUtilizadorId") REFERENCES "Utilizador"("UtilizadorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Morada" ADD CONSTRAINT "Morada_CodigoPostalCodigoPostalId_fkey" FOREIGN KEY ("CodigoPostalCodigoPostalId") REFERENCES "CodigoPostal"("CodigoPostalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_UtilizadorUtilizadorId_fkey" FOREIGN KEY ("UtilizadorUtilizadorId") REFERENCES "Utilizador"("UtilizadorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_UtilizadorUtilizadorId_fkey" FOREIGN KEY ("UtilizadorUtilizadorId") REFERENCES "Utilizador"("UtilizadorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_PagamentoPagamentoId_fkey" FOREIGN KEY ("PagamentoPagamentoId") REFERENCES "Pagamento"("PagamentoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_TipoSubscricaoTipoSubscricaoID_fkey" FOREIGN KEY ("TipoSubscricaoTipoSubscricaoID") REFERENCES "TipoSubscricao"("TipoSubscricaoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_MoradaMoradaId_fkey" FOREIGN KEY ("MoradaMoradaId") REFERENCES "Morada"("MoradaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_ContactoContactoId_fkey" FOREIGN KEY ("ContactoContactoId") REFERENCES "Contacto"("ContactoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_TipoUtilizadorTipoUtilizadorId_fkey" FOREIGN KEY ("TipoUtilizadorTipoUtilizadorId") REFERENCES "TipoUtilizador"("TipoUtilizadorId") ON DELETE RESTRICT ON UPDATE CASCADE;
