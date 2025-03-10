import { Utilizador } from 'wasp/entities'
import { getUtilizadores, useQuery } from 'wasp/client/operations'
import { FormEvent } from 'react'

export const MainPage = () => {
  const { data: utilizadores, isLoading, error } = useQuery(getUtilizadores)

  return (
    <div>
      {utilizadores && <UtilizadoresList utilizadores={utilizadores} />}

      {isLoading && 'Loading...'}
      {error && 'Error: ' + error}
    </div>
  )
}

const UtilizadorView = ({ utilizador }: { utilizador: Utilizador }) => {
  return (
    <div>
      <input type="checkbox" id={String(utilizador.UtilizadorId)}/>
      {utilizador.Nome}
    </div>
  )
}

const UtilizadoresList = ({ utilizadores }: { utilizadores: Utilizador[] }) => {
  if (!utilizadores?.length) return <div>No Users</div>

  return (
    <div>
      {utilizadores.map((utilizador, idx) => (
        <UtilizadorView utilizador={utilizador} key={idx} />
      ))}
    </div>
  )
}