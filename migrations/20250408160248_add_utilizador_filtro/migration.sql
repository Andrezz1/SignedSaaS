-- CreateTable
CREATE TABLE "UtilizadorFiltro" (
    "UtilizadorFiltroId" SERIAL NOT NULL,
    "nomeFiltro" TEXT NOT NULL,
    "filtros" JSONB NOT NULL,
    "DataCriado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UtilizadorId" INTEGER NOT NULL,

    CONSTRAINT "UtilizadorFiltro_pkey" PRIMARY KEY ("UtilizadorFiltroId")
);

-- AddForeignKey
ALTER TABLE "UtilizadorFiltro" ADD CONSTRAINT "UtilizadorFiltro_UtilizadorId_fkey" FOREIGN KEY ("UtilizadorId") REFERENCES "Utilizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
