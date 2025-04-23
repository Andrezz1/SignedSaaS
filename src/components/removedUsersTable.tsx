import {
    getUtilizadorDesabilitado,
    updateEstadoUtilizador,
    useQuery,
    useAction
  } from 'wasp/client/operations';
  import { useState } from 'react';
  import LoadingSpinner from '../layout/LoadingSpinner';
  
  const DisabledUsersTable = () => {
    const [tempSearch, setTempSearch] = useState('');
    const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [removedIds, setRemovedIds] = useState<number[]>([]);
    const [userToReactivate, setUserToReactivate] = useState<any>(null);
  
    const { data: response, isLoading } = useQuery(getUtilizadorDesabilitado, {
      page: currentPage,
      pageSize,
      searchTerm: searchFilter,
    });
  
    const disabledUsers = response?.data || [];
    const totalPages = response?.totalPages || 1;
  
    // ** Adicionado: filtra client-side com base em searchFilter **
    const filteredDisabledUsers = disabledUsers.filter(user => {
      const term = (searchFilter || '').toLowerCase();
      const nome = user.utilizador.Nome?.toLowerCase() || '';
      const tel  = user.contacto.Telemovel?.toLowerCase() || '';
      const nif  = user.utilizador.NIF?.toLowerCase() || '';
      return (
        nome.includes(term) ||
        tel.includes(term)  ||
        nif.includes(term)
      );
    });
  
    const reactivateUser = useAction(updateEstadoUtilizador);
  
    const handleReactivate = async (user: any) => {
      try {
        await reactivateUser({ id: user.utilizador.id, EstadoUtilizador: true });
        setRemovedIds(prev => [...prev, user.utilizador.id]);
      } catch (error) {
        console.error('Erro ao reativar utilizador:', error);
      }
    };
  
    const handleConfirmReactivate = async () => {
      if (!userToReactivate) return;
      await handleReactivate(userToReactivate);
      setUserToReactivate(null);
    };
  
    return (
      <div className="w-full transition-all duration-300">
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Filtros e pesquisa */}
          <div className="flex items-center justify-between p-6 gap-3 w-full bg-gray-100/40 dark:bg-gray-700/50">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-black dark:text-white">Por página:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="w-16 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                {[5, 10, 15, 20, 25].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
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
                  onClick={() => { setTempSearch(''); setSearchFilter(undefined); setCurrentPage(1); }}
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
          <div className="grid grid-cols-12 border-t-4 border-stroke py-4.5 px-4 dark:border-strokedark md:px-6">
            <div className="col-span-4 font-medium">Nome</div>
            <div className="col-span-4 font-medium">Nº Telemóvel</div>
            <div className="col-span-2 font-medium">NIF</div>
            <div className="col-span-2 font-medium text-center">Ações</div>
          </div>
  
          {/* Linhas da tabela */}
          {isLoading && <LoadingSpinner />}
          {!isLoading &&
            filteredDisabledUsers
              .filter(user => !removedIds.includes(user.utilizador.id))
              .map((user: any) => (
                <div key={user.utilizador.id} className="grid grid-cols-12 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6 items-center">
                  <div className="col-span-4 text-sm text-black dark:text-white">{user.utilizador.Nome}</div>
                  <div className="col-span-4 text-sm text-black dark:text-white">{user.contacto.Telemovel || 'Não disponível'}</div>
                  <div className="col-span-2 text-sm text-black dark:text-white">{user.utilizador.NIF}</div>
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => setUserToReactivate(user)}
                      className="px-4 py-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition"
                    >
                      Reativar
                    </button>
                  </div>
                </div>
              ))
          }
        </div>
  
        {/* Paginação fora da tabela */}
        <nav aria-label="Navegação de páginas" className="mt-4 flex justify-center">
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <button
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                className="flex items-center justify-center px-3 h-8 text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
              >
                Previous
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
                Next
              </button>
            </li>
          </ul>
        </nav>
  
        {/* Modal de confirmação */}
        {userToReactivate && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
              <p className="text-gray-800 font-medium">
                Tem a certeza que deseja reativar este utilizador?
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setUserToReactivate(null)}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReactivate}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold hover:from-green-600 hover:to-green-700 transition"
                >
                  Reativar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default DisabledUsersTable;
  