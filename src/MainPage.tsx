import { Utilizador } from 'wasp/entities'
import { getUtilizadores, useQuery } from 'wasp/client/operations'
import "./MainPage.css"

export const MainPage = () => {
  const { data: utilizadores, isLoading, error } = useQuery(getUtilizadores)

  return (
    <div className="container">
      <h1>Lista de Utilizadores</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">Error</p>}
      {utilizadores && <UtilizadoresTable utilizadores={utilizadores} />}
    </div>
  )
}


const UtilizadoresTable = ({ utilizadores }: { utilizadores: Utilizador[] }) => {
  if (!utilizadores?.length) return <div>No Users</div>

  return (
    <table className="utilizadores-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>NIF</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {utilizadores.map((utilizador, idx) => (
          <tr key={idx}>
            <td>{utilizador.Nome}</td>
            <td>{utilizador.NIF}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}