import { getUtilizadoresInfo, useQuery } from 'wasp/client/operations'
import { Utilizador } from 'wasp/entities'
import { useState, useEffect } from 'react'
import UserDetailsModal from '../../components/userDetails/UserDetailsModal'
import "./MainPage.css"
import Navbar from '../../components/navbar/navbar'

export const MainPage = () => {
  interface UtilizadoresTableProps {
    utilizadoresInfo: {
      utilizador: Utilizador;
      subscricoes: { EstadoSubscricao: boolean }[];
      contacto: { Telemovel: string }; 
    }[];
  }

  const UtilizadoresTable = ({ utilizadoresInfo }: UtilizadoresTableProps) => {
    const [nomeFilter, setNomeFilter] = useState<string>('')
    const [telemovelFilter, setTelemovelFilter] = useState<string>('')
    const [nifFilter, setNifFilter] = useState<string>('')
    const [subscricaoFilter, setSubscricaoFilter] = useState<string>('')
    const [openDropdown, setOpenDropdown] = useState<number | null>(null)
    const [selectedUser, setSelectedUser] = useState<any>(null)

    const handleNomeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setNomeFilter(event.target.value)
    }

    const toggleDropdown = (idx: number) => {
      setOpenDropdown(openDropdown === idx ? null : idx)
    }

    const handleTelemovelFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setTelemovelFilter(event.target.value)
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    const handleNifFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setNifFilter(event.target.value)
    }

    useEffect(() => {
      document.addEventListener('click', handleOutsideClick)
      return () => document.removeEventListener('click', handleOutsideClick)
    }, [])

    const handleSubscricaoFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSubscricaoFilter(event.target.value)
    }

    const filteredUtilizadores = utilizadoresInfo.filter(({ utilizador, subscricoes, contacto }) => {
      const estadoSubscricao = subscricoes.length > 0 ? (subscricoes.find(sub => sub.EstadoSubscricao) ? 'Ativa' : 'Expirada') : 'Sem Subscrição'
      const matchesNome = utilizador.Nome.toLowerCase().includes(nomeFilter.toLowerCase())
      const matchesNif = utilizador.NIF?.includes(nifFilter)
      const matchesTelemovel = contacto.Telemovel.includes(telemovelFilter)
      const matchesSubscricao = subscricaoFilter ? estadoSubscricao === subscricaoFilter : true
      return matchesNome && matchesTelemovel && matchesSubscricao && matchesNif
    })

    const openUserDetails = (utilizador: any, contacto: any, subscricoes: any) => {
      setSelectedUser({ utilizador, contacto, subscricoes })
      setOpenDropdown(null)
    }

    return (
      <>
        <h1>Lista de Utilizadores Registados no Sistema</h1>
        <table className="utilizadores-table">
          <thead>
            <tr className="filters-row">
              <th>
                <input
                  type="text"
                  placeholder="Filtrar por Nome"
                  onChange={handleNomeFilterChange}
                  value={nomeFilter}
                  className="filter-input"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filtrar por Nº Telemóvel"
                  onChange={handleTelemovelFilterChange}
                  value={telemovelFilter}
                  className="filter-input"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filtrar por NIF"
                  onChange={handleNifFilterChange}
                  value={nifFilter}
                  className="filter-input"
                />
              </th>
              <th>
                <select
                  onChange={handleSubscricaoFilterChange}
                  value={subscricaoFilter}
                  className="filter-select"
                >
                  <option value="">Todos</option>
                  <option value="Ativa">Ativa</option>
                  <option value="Expirada">Expirada</option>
                  <option value="Sem Subscrição">Sem Subscrição</option>
                </select>
              </th>
              <th></th>
            </tr>
            <tr>
              <th>Nome</th>
              <th>Nº Telemóvel</th>
              <th>NIF</th>
              <th>Estado da Subscrição</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredUtilizadores.map(({ utilizador, subscricoes, contacto }, idx) => {
              let estadoSubscricao = 'Sem Subscrição'
              if (subscricoes.length > 0) {
                const subscricaoAtiva = subscricoes.find(sub => sub.EstadoSubscricao)
                estadoSubscricao = subscricaoAtiva ? 'Ativa' : 'Expirada'
              }

              const numeroTelemovel = contacto?.Telemovel || 'Não disponível'

              return (
                <tr key={idx}>
                  <td>{utilizador.Nome}</td>
                  <td>{numeroTelemovel}</td>
                  <td>{utilizador.NIF}</td>
                  <td>{estadoSubscricao}</td>
                  <td className="dropdown-container">
                    <button className="settings-button" onClick={(e) => { e.stopPropagation(); toggleDropdown(idx) }}>⋮</button>

                    {openDropdown === idx && (
                      <div className="dropdown-menu">
                        <button onClick={() => openUserDetails(utilizador, contacto, subscricoes)}>Ver Detalhes</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {selectedUser && (
          <UserDetailsModal
            utilizador={selectedUser.utilizador}
            contacto={selectedUser.contacto}
            subscricoes={selectedUser.subscricoes}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </>
    )
  }
  const { data: utilizadoresInfo, error, isLoading } = useQuery(getUtilizadoresInfo)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <>
      <Navbar brandName=" Home" imageSrcPath="logo.png" navItems={["Dasboard","Sócios", "Conta"]} />
      <UtilizadoresTable utilizadoresInfo={utilizadoresInfo || []} />
    </>
  );
}
