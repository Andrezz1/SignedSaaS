import { Doacao, Utilizador } from 'wasp/entities'
import { type GetDoacao, type GetDoacaoInfo } from 'wasp/server/operations'
import { getUtilizadores } from './utilizadorService'

export const getDoacao: GetDoacao<void, Doacao[]> = async (args, context) => {
  return context.entities.Doacao.findMany({
    orderBy: { DoacaoId: 'asc' },
  })
}

export const getDoacaoInfo: GetDoacaoInfo<void, Array<{ 
  doacao: Doacao, 
  utilizador: Utilizador 
}>> = async (args, context) => {
    const doacoes = await getDoacao(args, context)
    const utilizadores = await getUtilizadores(args, context)

    const DoacaoInfo = doacoes.map(doacao => {
    const utilizador = utilizadores.find(u => u.UtilizadorId === doacao.UtilizadorUtilizadorId)
    return {
      doacao,
      utilizador: utilizador || { UtilizadorId: -1, Nome: 'Unknown', DataNascimento: new Date(0), NIF: 'Unknown', PalavraPasse: 'Unknown', MoradaMoradaId: -1, ContactoContactoId: -1, TipoUtilizadorTipoUtilizadorId: -1 },
    }
  })
  
  return DoacaoInfo
}
