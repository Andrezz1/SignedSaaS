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
    contacto: { Telemovel: string };  // ✅ Agora contacto é um objeto único, não um array
  }[];
}

const UtilizadoresTable = ({ utilizadoresInfo }: UtilizadoresTableProps) => {
  const [nomeFilter, setNomeFilter] = useState<string>('')
  const [telemovelFilter, setTelemovelFilter] = useState<string>('')
  const [nifFilter, setNifFilter] = useState<string>('')
  const [subscricaoFilter, setSubscricaoFilter] = useState<string>('')

  const handleNomeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNomeFilter(event.target.value)
  }

  const handleTelemovelFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTelemovelFilter(event.target.value)
  }

  const handleNifFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNifFilter(event.target.value)
  }

  const handleSubscricaoFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSubscricaoFilter(event.target.value)
  }

  const filteredUtilizadores = utilizadoresInfo.filter(({ utilizador, subscricoes,contacto}) => {
    const estadoSubscricao = subscricoes.length > 0 ? (subscricoes.find(sub => sub.EstadoSubscricao) ? 'Ativa' : 'Expirada') : 'Sem Subscrição';
    const matchesNome = utilizador.Nome.toLowerCase().includes(nomeFilter.toLowerCase())
    const matchesNif = utilizador.NIF.includes(nifFilter)
    const matchesTelemovel = contacto.Telemovel.includes(telemovelFilter)
    const matchesSubscricao = subscricaoFilter ? estadoSubscricao === subscricaoFilter : true
    return matchesNome && matchesTelemovel && matchesSubscricao && matchesNif
  })

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
          let estadoSubscricao = 'Sem Subscrição';
          if (subscricoes.length > 0) {
            const subscricaoAtiva = subscricoes.find(sub => sub.EstadoSubscricao);
            estadoSubscricao = subscricaoAtiva ? 'Ativa' : 'Expirada';
          }

          const numeroTelemovel = contacto?.Telemovel || 'Não disponível';

          return (
            <tr key={idx}>
              <td>{utilizador.Nome}</td>
              <td>{numeroTelemovel}</td>
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
