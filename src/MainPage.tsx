import { getUtilizadores, getSubscricaoInfo, useQuery } from 'wasp/client/operations'
import { Utilizador } from 'wasp/entities'
import "./MainPage.css"

export const MainPage = () => {
  const { data: subscricaoInfo, isLoading, error } = useQuery(getSubscricaoInfo)

  return (
    <div className="container">
      <h1>Lista de Utilizadores</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">Error</p>}
      {subscricaoInfo && <UtilizadoresTable subscricaoInfo={subscricaoInfo} />}
    </div>
  )
}

const UtilizadoresTable = ({ subscricaoInfo }: { subscricaoInfo: Array<{ subscricao: any, utilizador: Utilizador, pagamento: any, tipoSubscricao: any }> }) => {
  if (!subscricaoInfo?.length) return <div>No Users</div>

  return (
    <table className="utilizadores-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>NIF</th>
          <th>Estado da Subscrição</th>
          <th>Detalhes</th>
        </tr>
      </thead>
      <tbody>
        {subscricaoInfo.map(({ utilizador, subscricao }, idx) => (
          <tr key={idx}>
            <td>{utilizador.Nome}</td>
            <td>{utilizador.NIF}</td>
            <td>{subscricao ? subscricao.EstadoSubscricao : 'Sem subscrição'}</td>
            <td>
              <button className="settings-button">...</button> 
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
