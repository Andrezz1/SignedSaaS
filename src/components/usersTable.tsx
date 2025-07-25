import { 
  getUtilizadoresInfoByTipo, 
  updateEstadoUtilizador, 
  useQuery, 
  useAction 
} from 'wasp/client/operations';
import { useState } from 'react';
import LoadingSpinner from '../layout/LoadingSpinner';
import ExpandedUserDetails from './userDetails';
import EditUserContainer from './editUserContainer';
import { useNavigate } from 'react-router-dom';

interface UsersTableProps {
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  appliedFilters: {
    estadoSubscricao?: 'ativa' | 'expirada' | 'todas';
    faixaEtaria?: { min: number; max: number };
  };
}

const UsersTable = ({ showFilters, setShowFilters, appliedFilters }: UsersTableProps) => {
  const [tempSearch, setTempSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const navigate = useNavigate();

  const { data: utilizadoresInfoResponse, isLoading } = useQuery(getUtilizadoresInfoByTipo, {
    page: currentPage,
    pageSize: pageSize,
    searchTerm: searchFilter,
    tipoUtilizadorId: 3,
    filters: appliedFilters
  });

  const updateUserEstadoMutation = useAction(updateEstadoUtilizador);
  const utilizadoresInfo = utilizadoresInfoResponse?.data || [];
  const totalPages = utilizadoresInfoResponse?.totalPages || 1;

  const filteredUtilizadores = utilizadoresInfo.filter((user: any) => {
    const { utilizador, contacto } = user;
    return (
      utilizador.Nome?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (contacto?.Telemovel && contacto.Telemovel.includes(searchFilter)) ||
      (utilizador.NIF && utilizador.NIF.includes(searchFilter))
    );
  });

  const handleDelete = async () => {
    try {
      await updateUserEstadoMutation({
        id: userToDelete.utilizador.id,
        EstadoUtilizador: userToDelete.utilizador.EstadoUtilizador,
      });
      setUserToDelete(null);
    } catch (error) {
      console.error("Erro ao atualizar o estado do utilizador:", error);
    }
  };

  const handleSubscription = (user: any) => {
    navigate(`/my-subscriptions`, { state: { userId: user.utilizador.id } });
  };

    const handleHistory = (user: any) => {
    navigate(`/history`, { state: { userId: user.utilizador.id } });
  };

  const toggleDropdown = (userId: number) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  return (
    <div className="w-full transition-all duration-300">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header de ações e filtros */}
        <div className="flex items-center justify-between p-6 gap-3 w-full bg-gray-100/40 dark:bg-gray-700/50">
          <div className="flex items-center gap-8">
            <span
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-bold text-black cursor-pointer hover:text-gray-700"
            >
              <svg className="w-5 h-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              {showFilters ? "Esconder Filtros" : "Mostrar Filtros"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black">Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-15 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>
          <form
            className="relative w-[400px]"
            onSubmit={(e) => {
              e.preventDefault();
              setSearchFilter(tempSearch);
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
              onChange={(e) => setTempSearch(e.target.value)}
              className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            />
            {tempSearch && (
              <button
                type="button"
                onClick={() => {
                  setTempSearch("");
                  setSearchFilter("");
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

        {/* Cabeçalhos da tabela */}
        <div className="grid grid-cols-12 border-t-4 border-stroke py-4.5 px-4 dark:border-strokedark md:px-6">
          <div className="col-span-3 flex items-center">
            <p className="font-medium">Nome</p>
          </div>
          <div className="col-span-3 flex items-center">
            <p className="font-medium">Nº Telemóvel</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="font-medium">NIF</p>
          </div>
          <div className="col-span-3 flex items-center justify-center">
            <p className="font-medium">Estado da Subscrição</p>
          </div>
          <div className="col-span-2 flex items-center justify-center">
            <p className="font-medium">Ações</p>
          </div>
        </div>

        {/* Loading ou lista de utilizadores */}
        {isLoading && <LoadingSpinner />}
        {!isLoading && (
          <div className="w-full overflow-x-visible relative">
            <div className="min-w-[1024px] relative">
              {filteredUtilizadores.map((user: any) => {
                const { utilizador, subscricoes, contacto } = user;

                const hasActive = subscricoes.some((s: any) => s.EstadoSubscricao === true);
                const hasExpired = subscricoes.some((s: any) => s.EstadoSubscricao === false);

                const isOpen = selectedUser?.utilizador?.id === utilizador.id;

                return (
                  <div key={utilizador.id}>
                    {/* Linha da tabela com dados do utilizador */}
                    <div className="grid grid-cols-12 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6">
                      <div className="col-span-3 flex items-center">
                        <p className="text-sm text-black dark:text-white">{utilizador.Nome}</p>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <p className="text-sm text-black dark:text-white">
                          {contacto?.Telemovel || "Não disponível"}
                        </p>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <p className="text-sm text-black dark:text-white">{utilizador.NIF}</p>
                      </div>
                      <div className="col-span-3 justify-center flex items-center gap-2">
                        {hasActive && (
                          <span title="Tem pelo menos 1 Subscrição Átiva" className="inline-block">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6 text-green-500"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <circle cx="12" cy="12" r="10" fill="currentColor" />
                              <path
                                d="M16 9l-4.5 4.5L8 12"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        {hasExpired && (
                          <span title="Tem pelo menos 1 Subscrição Expirada" className="inline-block">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6 text-red-500"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <circle cx="12" cy="12" r="10" fill="currentColor" />
                              <path
                                d="M15 9l-6 6M9 9l6 6"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                      </div>

                      {/* Botões de ação */}
                      <div className="col-span-2 flex items-center justify-between gap-3">
                        <div className="flex items-center ">
                          {/* Botão principal de Subscrição */}
                          <button
                            onClick={() => handleSubscription(user)}
                            className="px-3 py-2 text-sm font-medium rounded-l-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors border border-gray-300 min-w-[140px]"
                          >
                            Gerir Subscrição
                          </button>
                          {/* Botão do dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(utilizador.id)}
                              className="px-2 py-2.5 text-sm font-medium rounded-r-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors border border-gray-300 border-l-0"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`w-4 h-4 transition-transform ${dropdownOpen === utilizador.id ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {dropdownOpen === utilizador.id && (
                              <div className="absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleHistory(user);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Histórico
                                  </button>
                                  <button
                                    onClick={() => {
                                      setUserToEdit(user);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 640 512" fill="currentColor">
                                      <path d="M224 256A128 128 0 1 0 96 128a128 128 0 0 0 128 128zm90.5 32h-11.7a174.08 174.08 0 0 1-157.6 0h-11.7A133.53 133.53 0 0 0 0 421.5V464a48 48 0 0 0 48 48h232.81a172.08 172.08 0 0 1 33.7-81.56l81.12-81.12c-9.63-3.6-19.8-5.32-30.13-5.32zm317.4-73.4L586.3 161.9a31.9 31.9 0 0 0-45.2 0L505 198l79.1 79.1 36.1-36.1a31.9 31.9 0 0 0 0-45.2zM493.7 253.4l-142 142a31.87 31.87 0 0 0-8.4 13.9l-22.2 66.3a16 16 0 0 0 20.2 20.2l66.3-22.2a31.87 31.87 0 0 0 13.9-8.4l142-142z" />
                                    </svg>
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Desativar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Botão Detalhes */}
                        <button
                          title="Ver Detalhes"
                          onClick={() => setSelectedUser(isOpen ? null : user)}
                          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                        >
                          {isOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                              viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                                d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
                              viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                                d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Detalhes expandidos */}
                    {isOpen && <ExpandedUserDetails user={user} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Modal de confirmação de eliminação */}
        {userToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
              <p className="text-gray-800 font-medium">
                Deseja remover o utilizador da lista de membros?
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edição do utilizador */}
        {userToEdit && (
          <EditUserContainer
            user={userToEdit}
            onClose={() => setUserToEdit(null)}
          />
        )}
      </div>
      {/* Paginação */}
        <nav aria-label="Page navigation" className="mt-4 flex justify-center">
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <button
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
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
                      ? "text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Seguinte
              </button>
            </li>
          </ul>
        </nav>
    </div>
  );
};

export default UsersTable;
