import { getUtilizadoresInfo, useQuery } from 'wasp/client/operations'
import { Utilizador } from 'wasp/entities'
import { useState, useEffect } from 'react'
import UserDetailsModal from '../components/userDetails/UserDetailsModal'
import FilterUsers from '../components/filterUsers'
import "../index.css"
import NavBar from '../components/navbar'

export const Dashboard = () => {
  interface UtilizadoresTableProps {
    utilizadoresInfo: {
      utilizador: Utilizador;
      subscricoes: { EstadoSubscricao: boolean }[];
      contacto: { Telemovel: string };
    }[];
  }

  const UtilizadoresTable = ({ utilizadoresInfo }: UtilizadoresTableProps) => {
    const [searchFilter, setSearchFilter] = useState<string>('')
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [showFilters, setShowFilters] = useState<boolean>(false)

    const filteredUtilizadores = utilizadoresInfo.filter(({ utilizador, subscricoes, contacto }) => {
      return (
        utilizador.Nome?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        contacto.Telemovel.includes(searchFilter) ||
        utilizador.NIF?.includes(searchFilter)
      )
    })

    return (
      <div className="p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4 bg-gray-100 p-3 rounded-md">
          <span
            onClick={() => setShowFilters(!showFilters)}
            className="text-base text-black font-semibold cursor-pointer hover:text-gray-800 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
          </span>
          <form className="relative w-[400px]">
            <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="search"
              placeholder="Pesquisar..."
              onChange={(e) => setSearchFilter(e.target.value)}
              value={searchFilter}
              className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>

        <div className="flex items-start gap-6">
          {showFilters && (
            <div className="w-1/5 min-w-[220px] mt-[6px]">
              <FilterUsers applyFilters={(filters) => console.log('Filtros aplicados:', filters)} />
            </div>
          )}
          <div className={`${showFilters ? 'w-4/5' : 'w-full'} transition-all duration-300`}>
            <table className="w-full border-collapse mt-[6px]">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Nome</th>
                  <th className="p-2">Nº Telemóvel</th>
                  <th className="p-2">NIF</th>
                  <th className="p-2">Estado da Subscrição</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUtilizadores.map(({ utilizador, subscricoes, contacto }, idx) => {
                  let estadoSubscricao = 'Sem Subscrição'
                  if (subscricoes.length > 0) {
                    const subscricaoAtiva = subscricoes.find(sub => sub.EstadoSubscricao)
                    estadoSubscricao = subscricaoAtiva ? 'Ativa' : 'Expirada'
                  }

                  const isOpen = selectedUser?.utilizador?.UtilizadorId === utilizador.UtilizadorId

                  return (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{utilizador.Nome}</td>
                      <td className="p-2">{contacto?.Telemovel || 'Não disponível'}</td>
                      <td className="p-2">{utilizador.NIF}</td>
                      <td className="p-2">{estadoSubscricao}</td>
                      <td className="p-2">
                        <div className="flex justify-center items-center gap-4">
                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle transition-all hover:bg-gray-900/10 active:bg-gray-900/20 focus:outline-none"
                            title="Eliminar"
                            onClick={() => console.log('Eliminar', utilizador)}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v1H9V4a1 1 0 011-1z" />
                            </svg>
                          </button>

                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle transition-all hover:bg-gray-900/10 active:bg-gray-900/20 focus:outline-none"
                            title="Editar"
                            onClick={() => console.log('Editar', utilizador)}
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.536-6.536a2 2 0 112.828 2.828L11.828 13.828a2 2 0 01-.828.464l-4 1a1 1 0 01-1.263-1.263l1-4a2 2 0 01.464-.828z" />
                            </svg>
                          </button>

                          <button
                            className="relative h-10 w-10 select-none rounded-lg text-center align-middle transition-all hover:bg-gray-900/10 active:bg-gray-900/20 focus:outline-none"
                            title="Ver mais"
                            onClick={() =>
                              setSelectedUser(isOpen ? null : { utilizador, contacto, subscricoes })
                            }
                          >
                            <svg
                              className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        {selectedUser && (
          <UserDetailsModal utilizador={selectedUser.utilizador} contacto={selectedUser.contacto} subscricoes={selectedUser.subscricoes} onClose={() => setSelectedUser(null)} />
        )}
      </div>
    )
  }

  const { data: utilizadoresInfo, error, isLoading } = useQuery(getUtilizadoresInfo)

  if (isLoading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-red-500 p-4">Error: {error.message}</div>

  return (
    <div className="w-full">
      <NavBar navItems={[
        { name: "Dashboard", path: "/dashboard" },
        { name: "Sócios", path: "/socios" },
        { name: "Conta", path: "/conta" }
      ]} />
      <div className="p-6">
        <UtilizadoresTable utilizadoresInfo={utilizadoresInfo || []} />
      </div>
    </div>
  );
}
