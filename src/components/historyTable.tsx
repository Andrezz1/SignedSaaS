import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getPagamentoByUtilizadorId } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';

interface PagamentosTableProps {
  utilizadorId: number;
  filters?: {
    tipoPagamento?: 'Subscricao' | 'Doacao';
  };
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
}

type MetodoPagamento = {
  MetodoPagamentoId: number;
  Nome: string;
};

type Subscricao = {
  SubscricaoId: number;
  DataInicio: Date;
  DataFim: Date;
  EstadoSubscricao: boolean;
};

type Doacao = {
  DoacaoId: number;
  ValorDoacao: number;
  Nota: string | null;
  DataDoacao: Date;
};

type Pagamento = {
  PagamentoId: number;
  DadosEspecificos: any;
  DataPagamento: Date;
  EstadoPagamento: string;
  NIFPagamento: string;
  Nota: string | null;
  Valor: number;
  DoacaoId: number | null;
  MetodoPagamentoId: number;
  UtilizadorId: number;
  MetodoPagamento: MetodoPagamento;
  Subscricoes: Subscricao[];
  Doacao: Doacao | null;
};

type Utilizador = {
  id: number;
  Nome: string;
  NIF: string;
  Contacto: {
    Email: string;
    Telemovel: string;
  };
};

type PagamentoInfo = {
  pagamento: Pagamento;
  utilizador: Utilizador;
};

const HistoryTable = ({ utilizadorId, filters, showFilters,setShowFilters }: PagamentosTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response, isLoading } = useQuery(getPagamentoByUtilizadorId, {
    utilizadorId,
    page: currentPage,
    pageSize,
    filters: filters?.tipoPagamento
      ? { tipoPagamento: filters.tipoPagamento }
      : undefined,
  }) as {
    data?: {
      data: PagamentoInfo[];
      totalPages: number;
      total: number;
      page: number;
      pageSize: number;
    };
    isLoading: boolean;
  };

  const pagamentos = response?.data || [];
  const totalPages = response?.totalPages || 1;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-PT', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' €';

  const formatDate = (date: Date) => date.toLocaleDateString();

  const getTipoPagamento = (pagamento: Pagamento): string => {
    if (pagamento.Subscricoes?.length > 0) return 'Subscrição';
    if (pagamento.Doacao) return 'Doação';
    return 'Outro';
  };

  return (
    <div className="w-full transition-all duration-300">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Topbar */}
        <div className="flex items-center justify-between p-6 gap-3 w-full bg-gray-100/40 dark:bg-gray-700/50">
          <div className="flex items-center gap-4">
            <span
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-bold text-black cursor-pointer hover:text-gray-700"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
            </span>
            <span className="text-sm font-bold text-black dark:text-white">Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-12 border-t-4 border-stroke py-4.5 px-4 md:px-6">
          <div className="col-span-3 font-medium">Tipo</div>
          <div className="col-span-2 font-medium">Valor</div>
          <div className="col-span-3 font-medium">Método</div>
          <div className="col-span-2 font-medium">Estado</div>
          <div className="col-span-2 font-medium">Data do Pagamento</div>
        </div>

        {/* Corpo da tabela */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          pagamentos.map(({ pagamento, utilizador }, i) => (
            <div
              key={i}
              className="grid grid-cols-12 border-t border-stroke py-4.5 px-4 md:px-6 items-center"
            >
              <div className="col-span-3 text-sm text-black dark:text-white">
                {getTipoPagamento(pagamento)}
              </div>
              <div className="col-span-2 text-sm text-black dark:text-white">
                {formatCurrency(pagamento.Valor)}
              </div>
              <div className="col-span-3 text-sm text-black dark:text-white">
                {pagamento.MetodoPagamento?.Nome || '–'}
              </div>
              <div className="col-span-2 text-sm text-black dark:text-white">
                {pagamento.EstadoPagamento}
              </div>
              <div className="col-span-2 text-sm text-black dark:text-white">
                {formatDate(pagamento.DataPagamento)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginação */}
      <nav className="mt-4 flex justify-center">
        <ul className="inline-flex -space-x-px text-sm">
          <li>
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              className="flex items-center justify-center px-3 h-8 text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100"
            >
              Anterior
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => setCurrentPage(i + 1)}
                className={`flex items-center justify-center px-3 h-8 ${
                  currentPage === i + 1
                    ? 'text-blue-600 bg-blue-50 border border-gray-300'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              className="flex items-center justify-center px-3 h-8 text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100"
            >
              Seguinte
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HistoryTable;
