-- CreateTable
CREATE TABLE "AuditPagamento" (
    "AuditPagamentoId" SERIAL NOT NULL,
    "Entidade" TEXT NOT NULL,
    "Operacao" TEXT NOT NULL,
    "DataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IdUtilizadorResponsavel" INTEGER NOT NULL,
    "ParametrosRecebidos" JSONB NOT NULL,
    "DadosAntes" JSONB,
    "DadosDepois" JSONB,
    "Resultado" TEXT NOT NULL,
    "MensagemErro" TEXT,

    CONSTRAINT "AuditPagamento_pkey" PRIMARY KEY ("AuditPagamentoId")
);

-- AddForeignKey
ALTER TABLE "AuditPagamento" ADD CONSTRAINT "AuditPagamento_IdUtilizadorResponsavel_fkey" FOREIGN KEY ("IdUtilizadorResponsavel") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
