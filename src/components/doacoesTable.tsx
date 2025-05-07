import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getDoacaoInfo } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';

const DoacoesTable = () => {
  const [tempSearch, setTempSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response, isLoading } = useQuery(getDoacaoInfo, {
    page: currentPage,
    pageSize,
    searchTerm: searchFilter,
  });

  const doacoes = response?.data || [];
  const totalPages = response?.totalPages || 1;

  // Função para formatar valores em formato europeu
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + ' €';
  };

  return (
    <div className="w-full transition-all duration-300">
      {/* Tabela com novo estilo */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Barra superior com pesquisa e paginação - novo estilo */}
        <div className="flex items-center justify-between p-6 gap-3 w-full bg-gray-100/40 dark:bg-gray-700/50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-black dark:text-white">Por página:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Campo de pesquisa - novo estilo */}
          <form
            className="relative w-64"
            onSubmit={e => {
              e.preventDefault();
              setSearchFilter(tempSearch || undefined);
              setCurrentPage(1);
            }}
          >
            <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
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
              className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Cabeçalho da tabela - novo estilo */}
        <div className="grid grid-cols-12 border-t-4 border-stroke py-4.5 px-4 dark:border-strokedark md:px-6">
          <div className="col-span-3 font-medium">Nome do Doador </div>
          <div className="col-span-3 font-medium">Valor Doado</div>
          <div className="col-span-3 font-medium">Nota</div>
          <div className="col-span-3 font-medium">Data da Doação</div>
        </div>

        {/* Conteúdo da tabela */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          doacoes.map(({ doacao, utilizador }, i) => (
            <div
              key={i}
              className="grid grid-cols-12 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 items-center"
            >
              <div className="col-span-3 text-sm text-black dark:text-white">
                {utilizador?.Nome && utilizador.Nome.trim() !== '' ? utilizador.Nome : '–'}
              </div>
              <div className="col-span-3 text-sm text-black dark:text-white">
                {formatCurrency(doacao.ValorDoacao)}
              </div>
              <div className="col-span-3 text-sm text-black dark:text-white">
                {doacao?.Nota && doacao.Nota.trim() !== '' ? doacao.Nota : '–'}
              </div>
              <div className="col-span-3 text-sm text-black dark:text-white">
                {new Date(doacao.DataDoacao).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginação - novo estilo */}
      <nav aria-label="Navegação de páginas" className="mt-4 flex justify-center">
        <ul className="inline-flex -space-x-px text-sm">
          <li>
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              className="flex items-center justify-center px-3 h-8 text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
            >
              Anterior
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => setCurrentPage(i + 1)}
                className={`flex items-center justify-center px-3 h-8 leading-tight ${
                  currentPage === i + 1
                    ? 'text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              className="flex items-center justify-center px-3 h-8 text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
            >
              Seguinte
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DoacoesTable;