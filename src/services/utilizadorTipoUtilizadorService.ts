import { TipoUtilizador, Utilizador } from 'wasp/entities'
import { type GetUtilizadorTipoUtilizador } from 'wasp/server/operations'
import { getUtilizadores } from './utilizadorService'
import { getTipoUtilizador } from './tipoUtilizadorService'

export const getUtilizadorTipoUtilizador: GetUtilizadorTipoUtilizador<void, Array<{ utilizador: Utilizador, tipoUtilizador: TipoUtilizador }>> = async (args, context) => {
  const utilizadores = await getUtilizadores(args, context)
  const tipoUtilizadores = await getTipoUtilizador(args, context)

  const utilizadoresWithTipoUtilizador = utilizadores.map(utilizador => {
    const tipoUtilizador = tipoUtilizadores.find(tu => tu.TipoUtilizadorId === utilizador.TipoUtilizadorTipoUtilizadorId)
    return {
      utilizador,
      tipoUtilizador: tipoUtilizador || { TipoUtilizadorId: -1, Descricao: 'Unknown' },
    }
  })

  return utilizadoresWithTipoUtilizador
}
