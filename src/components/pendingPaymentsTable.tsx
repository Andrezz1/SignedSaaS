import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getMetodoPagamento, getPagamentoByMetodoId } from 'wasp/client/operations';
import type { MetodoPagamento, Pagamento } from 'wasp/entities';
import LoadingSpinner from '../layout/LoadingSpinner';

// formata números para estilo pt-PT
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' €';

const PendingPaymentsTable: React.FC = () => {
  // estados de paginação/pesquisa
  const [tempSearch, setTempSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1) carregamento dos métodos
  const {
    data: methods,
    isLoading: loadingMethods,
    error: errMethods
  } = useQuery(getMetodoPagamento);

  // 2) método activo (tab) e refetch quando página, tamanho ou pesquisa mudam
  const [activeMethodId, setActiveMethodId] = useState<number|undefined>(undefined);
  useEffect(() => {
    if (methods && methods.length > 0) {
      setActiveMethodId(methods[0].MetodoPagamentoId);
    }
  }, [methods]);

  const {
    data: pagamentos,
    isLoading: loadingPayments,
    error: errPayments,
    refetch
  } = useQuery(
    getPagamentoByMetodoId,
    { MetodoPagamentoId: activeMethodId! },
    {
      enabled: activeMethodId !== undefined,
      // parâmetros de paginação e pesquisa
      page: currentPage,
      pageSize,
      searchTerm: searchFilter
    }
  );

  const totalPages = pagamentos?.totalPages ?? 1;
  const rows: Pagamento[] = pagamentos?.data ?? [];

  if (loadingMethods) return <LoadingSpinner />;
  if (errMethods) return <p className="p-4 text-red-500">Erro: {String(errMethods)}</p>;

  return (
    <div className="w-full transition-all duration-300 space-y-6">
      {/* Barra superior com tabs, pesquisa e paginação */}
      <div className="rounded-sm border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between p-6 gap-3 w-full bg-gray-100/40">
          {/* Tabs dos métodos */}
          <div className="flex space-x-4">
            {methods!.map(m => (
              <button
                key={m.MetodoPagamentoId}
                onClick={() => {
                  setActiveMethodId(m.MetodoPagamentoId);
                  setCurrentPage(1);
                }}
                className={`pb-2 text-sm font-bold ${
                  activeMethodId === m.MetodoPagamentoId
                    ? 'border-b-4 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {m.Nome}
              </button>
            ))}
          </div>
          {/* Por página */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-black">Por página:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm bg-white"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          {/* Pesquisa */}
          <form
            className="relative w-64"
            onSubmit={e => {
              e.preventDefault();
              setSearchFilter(tempSearch || undefined);
              setCurrentPage(1);
            }}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Pesquisar..."
              value={tempSearch}
              onChange={e => setTempSearch(e.target.value)}
              className="block w-full p-2 pl-10 pr-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            />
            {tempSearch && (
              <button
                type="button"
                onClick={() => {
                  setTempSearch('');
                  setSearchFilter(undefined);
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="grid grid-cols-12 border-t-4 border-stroke py-4.5 px-4 md:px-6">
          <div className="col-span-2 font-medium">ID</div>
          <div className="col-span-2 font-medium">Valor</div>
          <div className="col-span-3 font-medium">Utilizador</div>
          <div className="col-span-3 font-medium">Data</div>
          <div className="col-span-2 font-medium text-center">Estado</div>
        </div>

        {/* Linhas da tabela */}
        {loadingPayments ? (
          <LoadingSpinner />
        ) : rows.length > 0 ? (
          rows.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-12 border-t border-stroke py-4.5 px-4 md:px-6 items-center"
            >
              <div className="col-span-2 text-sm text-black">#{p.PagamentoId}</div>
              <div className="col-span-2 text-sm text-black">{formatCurrency(p.Valor)}</div>
              <div className="col-span-3 text-sm text-black">
                {p.UtilizadorId || '–'}
              </div>
              <div className="col-span-2 text-sm text-center text-gray-600">
                {p.EstadoPagamento}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">Não há pagamentos pendentes.</div>
        )}
      </div>
      {/* Paginação */}
      <nav aria-label="Navegação de páginas" className="mt-4 flex justify-center">
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <button
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                className="flex items-center justify-center px-3 h-8 text-gray-500 bg-white border border-e-0 border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
              >
                Anterior
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, idx) => (
              <li key={idx}>
                <button
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`flex items-center justify-center px-3 h-8 leading-tight ${
                    currentPage === idx + 1
                      ? 'text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {idx + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                className="flex items-center justify-center px-3 h-8 text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
              >
                Seguinte
              </button>
            </li>
          </ul>
        </nav>
    </div>
  );
};

export default PendingPaymentsTable;
