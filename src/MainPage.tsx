import { getUtilizadores, getSubscricaoInfo, useQuery } from 'wasp/client/operations'
import { Utilizador } from 'wasp/entities'
import "./MainPage.css"

export const MainPage = () => {
  const { data: utilizadores, isLoading: isLoadingUtilizadores, error: errorUtilizadores } = useQuery(getUtilizadores)
  const { data: subscricaoInfo, isLoading: isLoadingSubscricoes, error: errorSubscricoes } = useQuery(getSubscricaoInfo)

  return (
    <div className="container">
      <h1>Lista de Utilizadores</h1>
      {(isLoadingUtilizadores || isLoadingSubscricoes) && <p>Loading...</p>}
      {(errorUtilizadores || errorSubscricoes) && <p className="error">Error</p>}
      {utilizadores && subscricaoInfo && <UtilizadoresTable utilizadores={utilizadores} subscricaoInfo={subscricaoInfo} />}
    </div>
  )
}

const UtilizadoresTable = ({ utilizadores, subscricaoInfo }: { utilizadores: Utilizador[], subscricaoInfo: Array<{ subscricao: any, utilizador: Utilizador, pagamento: any, tipoSubscricao: any }> }) => {
  if (!utilizadores?.length) return <div>No Users</div>

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
        {utilizadores.map((utilizador, idx) => {
          const subscricao = subscricaoInfo.find(s => s.utilizador.UtilizadorId === utilizador.UtilizadorId)
          const estadoSubscricao = subscricao ? subscricao.subscricao.EstadoSubscricao : 'Sem subscrição'

          return (
            <tr key={idx}>
              <td>{utilizador.Nome}</td>
              <td>{utilizador.NIF}</td>
              <td>{estadoSubscricao}</td>
              <td>
                <button className="settings-button">...</button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}