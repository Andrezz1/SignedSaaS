import { getUtilizadoresInfo, useQuery } from 'wasp/client/operations'
import { Utilizador } from 'wasp/entities'
import { useState } from 'react'
import "./MainPage.css"

export const MainPage = () => {
  const { data: utilizadoresInfo, isLoading, error } = useQuery(getUtilizadoresInfo)

  return (
    <div className="container">
      <h1>Lista de Utilizadores</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">Error</p>}
      {utilizadoresInfo && <UtilizadoresTable utilizadoresInfo={utilizadoresInfo} />}
    </div>
  )
}

interface UtilizadoresTableProps {
  utilizadoresInfo: {
    utilizador: Utilizador;
    subscricoes: { EstadoSubscricao: boolean }[];
  }[];
}

const UtilizadoresTable = ({ utilizadoresInfo }: UtilizadoresTableProps) => {
  const [nomeFilter, setNomeFilter] = useState<string>('')
  const [nifFilter, setNifFilter] = useState<string>('')
  const [subscricaoFilter, setSubscricaoFilter] = useState<string>('')

  const handleNomeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNomeFilter(event.target.value)
  }

  const handleNifFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNifFilter(event.target.value)
  }

  const handleSubscricaoFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSubscricaoFilter(event.target.value)
  }

  const filteredUtilizadores = utilizadoresInfo.filter(({ utilizador, subscricoes }) => {
    const estadoSubscricao = subscricoes.length > 0 ? (subscricoes.find(sub => sub.EstadoSubscricao) ? 'Ativa' : 'Expirada') : 'Sem Subscrição';
    const matchesNome = utilizador.Nome.toLowerCase().includes(nomeFilter.toLowerCase())
    const matchesNif = utilizador.NIF.includes(nifFilter)
    const matchesSubscricao = subscricaoFilter ? estadoSubscricao === subscricaoFilter : true
    return matchesNome && matchesNif && matchesSubscricao
  })

  if (!filteredUtilizadores?.length) return <div>No Users</div>

  return (
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
          <th></th> {/* Coluna vazia para alinhar com os botões de detalhes */}
        </tr>
        <tr>
          <th>Nome</th>
          <th>NIF</th>
          <th>Estado da Subscrição</th>
          <th>Detalhes</th>
        </tr>
      </thead>
      <tbody>
        {filteredUtilizadores.map(({ utilizador, subscricoes }, idx) => {
          let estadoSubscricao = 'Sem Subscrição';
          if (subscricoes.length > 0) {
            const subscricaoAtiva = subscricoes.find(sub => sub.EstadoSubscricao);
            estadoSubscricao = subscricaoAtiva ? 'Ativa' : 'Expirada';
          }

          return (
            <tr key={idx}>
              <td>{utilizador.Nome}</td>
              <td>{utilizador.NIF}</td>
              <td>{estadoSubscricao}</td>
              <td>
                <button className="settings-button">⋮</button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
