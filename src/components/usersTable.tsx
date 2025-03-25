import { getUtilizadoresInfo, useQuery } from 'wasp/client/operations';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../layout/LoadingSpinner';
import UserDetailsModal from '../components/userDetails/UserDetailsModal';
import FilterUsers from '../components/filterUsers';

const UsersTable = () => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { data: utilizadoresInfo, isLoading, error } = useQuery(getUtilizadoresInfo);

  const filteredUtilizadores = utilizadoresInfo?.filter(({ utilizador, subscricoes, contacto }) => {
    return (
      utilizador.Nome?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      contacto.Telemovel.includes(searchFilter) ||
      utilizador.NIF?.includes(searchFilter)
    );
  }) || [];

  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
        <div className='flex-col flex items-start justify-between p-6 gap-3 w-full bg-gray-100/40 dark:bg-gray-700/50'>
          <span className='text-sm font-medium'>Filtros:</span>
          <div className='flex items-center justify-between gap-3 w-full px-2'>
            <div className='relative flex items-center gap-3 '>
              <form className='relative w-[400px]'>
                <div className='absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none'>
                  <svg className='w-4 h-4 text-gray-500' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'>
                    <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z' />
                  </svg>
                </div>
                <input
                  type='search'
                  placeholder='Pesquisar...'
                  onChange={(e) => setSearchFilter(e.target.value)}
                  value={searchFilter}
                  className='block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500'
                />
              </form>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className='ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
              >
                {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
              </button>
            </div>
          </div>
          {showFilters && (
            <div className='w-full mt-4'>
              <FilterUsers applyFilters={(filters) => console.log('Filtros aplicados:', filters)} />
            </div>
          )}
        </div>

        <div className='grid grid-cols-12 border-t-4 border-stroke py-4.5 px-4 dark:border-strokedark md:px-6'>
          <div className='col-span-3 flex items-center'>
            <p className='font-medium'>Nome</p>
          </div>
          <div className='col-span-3 flex items-center'>
            <p className='font-medium'>Nº Telemóvel</p>
          </div>
          <div className='col-span-2 flex items-center'>
            <p className='font-medium'>NIF</p>
          </div>
          <div className='col-span-2 flex items-center'>
            <p className='font-medium'>Estado da Subscrição</p>
          </div>
          <div className='col-span-2 flex items-center justify-center'>
            <p className='font-medium'>Ações</p>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {!isLoading && filteredUtilizadores.map(({ utilizador, subscricoes, contacto }, idx) => {
          let estadoSubscricao = 'Sem Subscrição';
          if (subscricoes.length > 0) {
            const subscricaoAtiva = subscricoes.find(sub => sub.EstadoSubscricao);
            estadoSubscricao = subscricaoAtiva ? 'Ativa' : 'Expirada';
          }

          const isOpen = selectedUser?.utilizador?.UtilizadorId === utilizador.id;

          return (
            <div key={idx} className='grid grid-cols-12 border-t border-stroke py-4.5 px-4 dark:border-strokedark md:px-6'>
              <div className='col-span-3 flex items-center'>
                <p className='text-sm text-black dark:text-white'>{utilizador.Nome}</p>
              </div>
              <div className='col-span-3 flex items-center'>
                <p className='text-sm text-black dark:text-white'>{contacto?.Telemovel || 'Não disponível'}</p>
              </div>
              <div className='col-span-2 flex items-center'>
                <p className='text-sm text-black dark:text-white'>{utilizador.NIF}</p>
              </div>
              <div className='col-span-2 flex items-center'>
                <p className='text-sm text-black dark:text-white'>{estadoSubscricao}</p>
              </div>
              <div className='col-span-2 flex items-center justify-center gap-4'>
                <button
                  title='Eliminar'
                  onClick={() => console.log('Eliminar', utilizador)}
                  className='hover:text-red-500'
                >
                  🗑️
                </button>
                <button
                  title='Editar'
                  onClick={() => console.log('Editar', utilizador)}
                  className='hover:text-blue-500'
                >
                  ✏️
                </button>
                <button
                  title='Ver mais'
                  onClick={() => setSelectedUser(isOpen ? null : { utilizador, contacto, subscricoes })}
                  className='hover:text-green-500'
                >
                  {isOpen ? '🔼' : '🔽'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedUser && (
        <UserDetailsModal
          utilizador={selectedUser.utilizador}
          contacto={selectedUser.contacto}
          subscricoes={selectedUser.subscricoes}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default UsersTable;
