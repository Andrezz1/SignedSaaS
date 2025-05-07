-- CreateTable
CREATE TABLE "AuditTipoSubscricao" (
    "AuditTipoSubscricaoId" SERIAL NOT NULL,
    "Entidade" TEXT NOT NULL,
    "Operacao" TEXT NOT NULL,
    "DataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IdUtilizadorResponsavel" INTEGER NOT NULL,
    "ParametrosRecebidos" JSONB NOT NULL,
    "DadosAntes" JSONB,
    "DadosDepois" JSONB,
    "Resultado" TEXT NOT NULL,
    "MensagemErro" TEXT,

    CONSTRAINT "AuditTipoSubscricao_pkey" PRIMARY KEY ("AuditTipoSubscricaoId")
);

-- AddForeignKey
ALTER TABLE "AuditTipoSubscricao" ADD CONSTRAINT "AuditTipoSubscricao_IdUtilizadorResponsavel_fkey" FOREIGN KEY ("IdUtilizadorResponsavel") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
