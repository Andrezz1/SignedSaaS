-- DropForeignKey
ALTER TABLE "Subscricao" DROP CONSTRAINT "Subscricao_PagamentoPagamentoId_fkey";

-- AlterTable
ALTER TABLE "Subscricao" ALTER COLUMN "PagamentoPagamentoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_PagamentoPagamentoId_fkey" FOREIGN KEY ("PagamentoPagamentoId") REFERENCES "Pagamento"("PagamentoId") ON DELETE SET NULL ON UPDATE CASCADE;
