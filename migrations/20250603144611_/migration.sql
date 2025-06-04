-- CreateTable
CREATE TABLE "Utilizador" (
    "id" SERIAL NOT NULL,
    "DataNascimento" TIMESTAMP(3),
    "EstadoUtilizador" BOOLEAN NOT NULL DEFAULT true,
    "Imagem" TEXT,
    "NIF" TEXT,
    "Nome" TEXT,
    "NumMembro" INTEGER,
    "Username" TEXT,
    "ContactoContactoId" INTEGER,
    "MoradaMoradaId" INTEGER,
    "TipoUtilizadorTipoUtilizadorId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Utilizador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessToken" (
    "TokenId" SERIAL NOT NULL,
    "Token" TEXT NOT NULL,
    "UtilizadorId" INTEGER NOT NULL,
    "ExpiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("TokenId")
);

-- CreateTable
CREATE TABLE "AuditPagamento" (
    "AuditPagamentoId" SERIAL NOT NULL,
    "DadosAntes" JSONB,
    "DadosDepois" JSONB,
    "DataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MensagemErro" TEXT,
    "Operacao" TEXT NOT NULL,
    "ParametrosRecebidos" JSONB NOT NULL,
    "Resultado" TEXT NOT NULL,
    "IdUtilizadorResponsavel" INTEGER NOT NULL,

    CONSTRAINT "AuditPagamento_pkey" PRIMARY KEY ("AuditPagamentoId")
);

-- CreateTable
CREATE TABLE "AuditTipoSubscricao" (
    "AuditTipoSubscricaoId" SERIAL NOT NULL,
    "DadosAntes" JSONB,
    "DadosDepois" JSONB,
    "DataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MensagemErro" TEXT,
    "Operacao" TEXT NOT NULL,
    "ParametrosRecebidos" JSONB NOT NULL,
    "Resultado" TEXT NOT NULL,
    "IdUtilizadorResponsavel" INTEGER NOT NULL,

    CONSTRAINT "AuditTipoSubscricao_pkey" PRIMARY KEY ("AuditTipoSubscricaoId")
);

-- CreateTable
CREATE TABLE "AuditUtilizador" (
    "AuditUtilizadorId" SERIAL NOT NULL,
    "DadosAntes" JSONB,
    "DadosDepois" JSONB,
    "DataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MensagemErro" TEXT,
    "Operacao" TEXT NOT NULL,
    "ParametrosRecebidos" JSONB NOT NULL,
    "Resultado" TEXT NOT NULL,
    "IdUtilizadorResponsavel" INTEGER NOT NULL,

    CONSTRAINT "AuditUtilizador_pkey" PRIMARY KEY ("AuditUtilizadorId")
);

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
    "SubscricaoSubscricaoId" INTEGER,
    "UtilizadorId" INTEGER NOT NULL,

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
    "Desconto" DOUBLE PRECISION,
    "Quantidade" INTEGER NOT NULL,
    "ValorFinal" DOUBLE PRECISION NOT NULL,
    "SubscricaoSubscricaoId" INTEGER NOT NULL,
    "TipoSubscricaoTipoSubscricaoID" INTEGER NOT NULL,

    CONSTRAINT "DetalheSubscricao_pkey" PRIMARY KEY ("DetalheSubscricaoId")
);

-- CreateTable
CREATE TABLE "Doacao" (
    "DoacaoId" SERIAL NOT NULL,
    "DataDoacao" TIMESTAMP(3) NOT NULL,
    "Nota" TEXT NOT NULL,
    "ValorDoacao" DOUBLE PRECISION NOT NULL,
    "UtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "Doacao_pkey" PRIMARY KEY ("DoacaoId")
);

-- CreateTable
CREATE TABLE "Duracao" (
    "DuracaoId" SERIAL NOT NULL,
    "Meses" INTEGER NOT NULL,
    "Nome" TEXT NOT NULL,

    CONSTRAINT "Duracao_pkey" PRIMARY KEY ("DuracaoId")
);

-- CreateTable
CREATE TABLE "MetodoPagamento" (
    "MetodoPagamentoId" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,

    CONSTRAINT "MetodoPagamento_pkey" PRIMARY KEY ("MetodoPagamentoId")
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
    "DadosEspecificos" JSONB,
    "DataPagamento" TIMESTAMP(3) NOT NULL,
    "EstadoPagamento" TEXT NOT NULL,
    "NIFPagamento" TEXT NOT NULL,
    "Nota" TEXT,
    "Valor" INTEGER NOT NULL,
    "DoacaoId" INTEGER,
    "MetodoPagamentoId" INTEGER NOT NULL DEFAULT 1,
    "UtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("PagamentoId")
);

-- CreateTable
CREATE TABLE "Subscricao" (
    "SubscricaoId" SERIAL NOT NULL,
    "DataFim" TIMESTAMP(3) NOT NULL,
    "DataInicio" TIMESTAMP(3) NOT NULL,
    "EstadoSubscricao" BOOLEAN NOT NULL DEFAULT false,
    "DuracaoId" INTEGER,
    "PagamentoPagamentoId" INTEGER,
    "TipoSubscricaoTipoSubscricaoID" INTEGER NOT NULL,
    "UtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "Subscricao_pkey" PRIMARY KEY ("SubscricaoId")
);

-- CreateTable
CREATE TABLE "TipoSubscricao" (
    "TipoSubscricaoID" SERIAL NOT NULL,
    "Descricao" TEXT NOT NULL DEFAULT '',
    "Nome" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TipoSubscricao_pkey" PRIMARY KEY ("TipoSubscricaoID")
);

-- CreateTable
CREATE TABLE "TipoSubscricaoDuracao" (
    "TipoSubscricaoDuracaoId" SERIAL NOT NULL,
    "Valor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "TipoSubscricaoID" INTEGER NOT NULL,
    "DuracaoId" INTEGER NOT NULL,

    CONSTRAINT "TipoSubscricaoDuracao_pkey" PRIMARY KEY ("TipoSubscricaoDuracaoId")
);

-- CreateTable
CREATE TABLE "TipoUtilizador" (
    "TipoUtilizadorId" SERIAL NOT NULL,
    "Descricao" TEXT NOT NULL,

    CONSTRAINT "TipoUtilizador_pkey" PRIMARY KEY ("TipoUtilizadorId")
);

-- CreateTable
CREATE TABLE "UtilizadorFiltro" (
    "UtilizadorFiltroId" SERIAL NOT NULL,
    "filtros" JSONB NOT NULL,
    "nomeFiltro" TEXT NOT NULL,
    "UtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "UtilizadorFiltro_pkey" PRIMARY KEY ("UtilizadorFiltroId")
);

-- CreateTable
CREATE TABLE "Auth" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "providerName" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerData" TEXT NOT NULL DEFAULT '{}',
    "authId" TEXT NOT NULL,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("providerName","providerUserId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_NIF_key" ON "Utilizador"("NIF");

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_NumMembro_key" ON "Utilizador"("NumMembro");

-- CreateIndex
CREATE UNIQUE INDEX "Utilizador_Username_key" ON "Utilizador"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_Token_key" ON "AccessToken"("Token");

-- CreateIndex
CREATE UNIQUE INDEX "MetodoPagamento_Nome_key" ON "MetodoPagamento"("Nome");

-- CreateIndex
CREATE UNIQUE INDEX "Pagamento_DoacaoId_key" ON "Pagamento"("DoacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoSubscricaoDuracao_TipoSubscricaoID_DuracaoId_key" ON "TipoSubscricaoDuracao"("TipoSubscricaoID", "DuracaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_userId_key" ON "Auth"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_MoradaMoradaId_fkey" FOREIGN KEY ("MoradaMoradaId") REFERENCES "Morada"("MoradaId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_ContactoContactoId_fkey" FOREIGN KEY ("ContactoContactoId") REFERENCES "Contacto"("ContactoId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utilizador" ADD CONSTRAINT "Utilizador_TipoUtilizadorTipoUtilizadorId_fkey" FOREIGN KEY ("TipoUtilizadorTipoUtilizadorId") REFERENCES "TipoUtilizador"("TipoUtilizadorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessToken" ADD CONSTRAINT "AccessToken_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditPagamento" ADD CONSTRAINT "AuditPagamento_IdUtilizadorResponsavel_fkey" FOREIGN KEY ("IdUtilizadorResponsavel") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTipoSubscricao" ADD CONSTRAINT "AuditTipoSubscricao_IdUtilizadorResponsavel_fkey" FOREIGN KEY ("IdUtilizadorResponsavel") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditUtilizador" ADD CONSTRAINT "AuditUtilizador_IdUtilizadorResponsavel_fkey" FOREIGN KEY ("IdUtilizadorResponsavel") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprovativo" ADD CONSTRAINT "Comprovativo_PagamentoPagamentoId_fkey" FOREIGN KEY ("PagamentoPagamentoId") REFERENCES "Pagamento"("PagamentoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprovativo" ADD CONSTRAINT "Comprovativo_SubscricaoSubscricaoId_fkey" FOREIGN KEY ("SubscricaoSubscricaoId") REFERENCES "Subscricao"("SubscricaoId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comprovativo" ADD CONSTRAINT "Comprovativo_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalheSubscricao" ADD CONSTRAINT "DetalheSubscricao_SubscricaoSubscricaoId_fkey" FOREIGN KEY ("SubscricaoSubscricaoId") REFERENCES "Subscricao"("SubscricaoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalheSubscricao" ADD CONSTRAINT "DetalheSubscricao_TipoSubscricaoTipoSubscricaoID_fkey" FOREIGN KEY ("TipoSubscricaoTipoSubscricaoID") REFERENCES "TipoSubscricao"("TipoSubscricaoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Morada" ADD CONSTRAINT "Morada_CodigoPostalCodigoPostalId_fkey" FOREIGN KEY ("CodigoPostalCodigoPostalId") REFERENCES "CodigoPostal"("CodigoPostalId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_DoacaoId_fkey" FOREIGN KEY ("DoacaoId") REFERENCES "Doacao"("DoacaoId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_MetodoPagamentoId_fkey" FOREIGN KEY ("MetodoPagamentoId") REFERENCES "MetodoPagamento"("MetodoPagamentoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_DuracaoId_fkey" FOREIGN KEY ("DuracaoId") REFERENCES "Duracao"("DuracaoId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_PagamentoPagamentoId_fkey" FOREIGN KEY ("PagamentoPagamentoId") REFERENCES "Pagamento"("PagamentoId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_TipoSubscricaoTipoSubscricaoID_fkey" FOREIGN KEY ("TipoSubscricaoTipoSubscricaoID") REFERENCES "TipoSubscricao"("TipoSubscricaoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscricao" ADD CONSTRAINT "Subscricao_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoSubscricaoDuracao" ADD CONSTRAINT "TipoSubscricaoDuracao_DuracaoId_fkey" FOREIGN KEY ("DuracaoId") REFERENCES "Duracao"("DuracaoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoSubscricaoDuracao" ADD CONSTRAINT "TipoSubscricaoDuracao_TipoSubscricaoID_fkey" FOREIGN KEY ("TipoSubscricaoID") REFERENCES "TipoSubscricao"("TipoSubscricaoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UtilizadorFiltro" ADD CONSTRAINT "UtilizadorFiltro_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilizador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_authId_fkey" FOREIGN KEY ("authId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Auth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
