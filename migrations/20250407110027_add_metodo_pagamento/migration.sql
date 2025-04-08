-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "DadosEspecificos" JSONB,
ADD COLUMN     "MetodoPagamentoId" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "MetodoPagamento" (
    "MetodoPagamentoId" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,

    CONSTRAINT "MetodoPagamento_pkey" PRIMARY KEY ("MetodoPagamentoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetodoPagamento_Nome_key" ON "MetodoPagamento"("Nome");

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_MetodoPagamentoId_fkey" FOREIGN KEY ("MetodoPagamentoId") REFERENCES "MetodoPagamento"("MetodoPagamentoId") ON DELETE RESTRICT ON UPDATE CASCADE;
