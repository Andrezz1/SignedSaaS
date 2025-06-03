import { defineUserSignupFields } from 'wasp/auth/providers/types'

export const getUserFields = defineUserSignupFields({
  Username: (data: any) => data.username,
  TipoUtilizador: async (data) => {
    if (!data.TipoUtilizadorId) {
      throw new Error('TipoUtilizador é obrigatório')
    }
    const tipoUtilizadorId = Number(data.TipoUtilizadorId)
    return {
      connect: { TipoUtilizadorId: tipoUtilizadorId }
    }
  },
  Entidade: async(data) => {
    if(!data.EntidadeId) {
      throw new Error('Entidade é obrigatoria')
    }
    const entidadeId = Number(data.EntidadeId)
    return {
      connect: { EntidadeId: entidadeId }
    }
  }
})
