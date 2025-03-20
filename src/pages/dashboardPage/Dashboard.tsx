import { getUtilizadoresInfo, useQuery } from 'wasp/client/operations'
import { Utilizador } from 'wasp/entities'
import { useState, useEffect } from 'react'
import UserDetailsModal from '../../components/userDetails/UserDetailsModal'
import FilterUsers from '../../components/filterUsers'
import "../../index.css"
import NavBar from '../../components/navbar'

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
    const [openDropdown, setOpenDropdown] = useState<number | null>(null)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [showFilters, setShowFilters] = useState<boolean>(false)

    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (!(event.target as HTMLElement).closest('.dropdown-container')) {
          setOpenDropdown(null)
        }
      }
      document.addEventListener('click', handleOutsideClick)
      return () => document.removeEventListener('click', handleOutsideClick)
    }, [])

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
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-700 text-sm font-medium flex items-center gap-2 hover:text-gray-900 transition px-2 py-1"
          >
            <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6.586l-5.707-5.707A1 1 0 013 6V4z" />
            </svg>
            {showFilters ? 'Esconder Filtros' : 'Mostrar Filtros'}
          </button>
          <form className="max-w-xl w-1/2 relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="search"
              placeholder="Pesquisar..."
              onChange={(e) => setSearchFilter(e.target.value)}
              value={searchFilter}
              className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>
        </div>
        <div className="flex gap-4">
          {showFilters && (
            <div className="w-1/5 min-w-[220px]">
              <FilterUsers applyFilters={(filters) => console.log('Filtros aplicados:', filters)} />
            </div>
          )}
          <div className={`${showFilters ? 'w-4/5' : 'w-full'} transition-all duration-300`}>
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Nome</th>
                  <th className="p-2">Nº Telemóvel</th>
                  <th className="p-2">NIF</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUtilizadores.map(({ utilizador, subscricoes, contacto }, idx) => {
                  return (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{utilizador.Nome}</td>
                      <td className="p-2">{contacto?.Telemovel || 'Não disponível'}</td>
                      <td className="p-2">{utilizador.NIF}</td>
                      <td className="p-2 relative dropdown-container">
                        <button className="text-lg" onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}>⋮</button>
                        {openDropdown === idx && (
                          <div className="absolute right-0 top-full bg-gray-200 border border-gray-400 rounded-md shadow-md w-32 z-10">
                            <button onClick={() => setSelectedUser({ utilizador, contacto, subscricoes })} className="block w-full p-2 text-left hover:bg-gray-300">Ver Detalhes</button>
                          </div>
                        )}
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
      <NavBar navItems={["Dashboard", "Sócios", "Conta"]} />
      <div className="p-6">
        <UtilizadoresTable utilizadoresInfo={utilizadoresInfo || []} />
      </div>
    </div>
  ); 
}
