import { Utilizador, CodigoPostal } from 'wasp/entities'
import { createCodigoPostal, getUtilizadores, useQuery } from 'wasp/client/operations'
import { FormEvent } from 'react'

export const MainPage = () => {
  const { data: utilizadores, isLoading, error } = useQuery(getUtilizadores)

  return (
    <div>
      <NewCodigoPostalForm />
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

const NewCodigoPostalForm = () => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const target = event.target as HTMLFormElement
      const Localidade = target.Localidade.value
      target.reset()
      await createCodigoPostal({ Localidade })
    } catch (err: any) {
      window.alert('Error: ' + err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="Localidade" type="text" defaultValue="" />
      <input type="submit" value="Create task" />
    </form>
  )
}
