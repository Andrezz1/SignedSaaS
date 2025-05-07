import { Contacto, Morada, TipoUtilizador, Utilizador, Subscricao} from 'wasp/entities'
import { 
  type GetSocios, 
  type GetUtilizadorByNIF, 
  type GetUtilizadoresInfoByTipo, 
  type CreateUtilizador, 
  type UpdateUtilizador, 
  type GetUtilizadorDesabilitado,
  type UpdateEstadoUtilizador,
  type UpdateUtilizadorByNIFNumSocio,
  type GetUtilizadorInfoById,
  type GetSociosPagantes,
} from 'wasp/server/operations'
import { capitalize, saveImageLocally } from './utils'
import { HttpError } from 'wasp/server'
import { registarAuditLog } from './auditService'

export const getSocios: GetSocios<void, number> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não tem permissão')
  }

  const where: any = {
    NumSocio: { not: null },
    EstadoUtilizador: true
  }

  const totalSocios = await context.entities.Utilizador.count({
    where,
  })

  return totalSocios
}

export const getSociosPagantes: GetSociosPagantes<void, number  
> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não tem permissão')
  }

  const where: any= {
    NumSocio: { not: null },
    Subscricoes: {
      some: {
        EstadoSubscricao: true
      }
    }
  }

  const totalSociosPagantes = await context.entities.Utilizador.count({
    where,
  })

  return totalSociosPagantes
}

export const getUtilizadorDesabilitado: GetUtilizadorDesabilitado<
  { 
    page: number,
    pageSize: number,
    searchTerm?: string,
  },
  {
    data: {
      utilizador: Utilizador
      contacto: Contacto
    }[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
> = async ({ page, pageSize, searchTerm }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const skip = (page - 1) * pageSize
  const take = pageSize

  const utilizadoresdesativados: any = {
      EstadoUtilizador: false,
  }

  if (searchTerm) {
    utilizadoresdesativados.OR = [
      { Nome: { contains: searchTerm, mode: 'insensitive' } },
      { NIF: { contains: searchTerm, mode: 'insensitive' } },
      { Contacto: { Telemovel: { contains: searchTerm, mode: 'insensitive' } } }
    ]
  }

  const utilizadores = await context.entities.Utilizador.findMany({
    where: {
      EstadoUtilizador: false,
      NumSocio: { not: null }
    },
    orderBy: {
      id: 'desc',
    },
    include: {
      Contacto: true,
    },
    skip,
    take,
  })

  const totalUtilizadores = await context.entities.Utilizador.count({
    where: utilizadoresdesativados, 
  })

  const utilizadoresInfo = utilizadores.map(
    ({ Contacto, ...utilizador }) => ({
      utilizador,
      contacto: Contacto!
    })
  )

  return {
    data: utilizadoresInfo,
    total: totalUtilizadores,
    page,
    pageSize,
    totalPages: Math.ceil(totalUtilizadores / pageSize),
  }
}

export const getUtilizadorInfoById: GetUtilizadorInfoById<{ id: number }, Array<{ 
  utilizador: Utilizador, 
  tipoUtilizador: TipoUtilizador | null,
  morada: Morada | null, 
  contacto: Contacto | null,
  subscricoes: Subscricao[]
}>> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  if(!args.id) {
    throw new Error("ID do utilizador é obrigatório")
  }

  const utilizadores = await context.entities.Utilizador.findMany({
    where: {
      id: args.id,
    },
    include: {
      TipoUtilizador: true, 
      Morada: {
        include: {
          CodigoPostal: true
        }
      },
      Contacto: true, 
      Subscricoes: true, 
    },
  }) as Array<Utilizador & {
      TipoUtilizador: TipoUtilizador | null
      Morada: Morada | null
      Contacto: Contacto | null
      Subscricoes: Subscricao[]
    }
  >

  if (!utilizadores || utilizadores.length === 0) {
    return []
  }

  const result = utilizadores.map(({ TipoUtilizador, Morada, Contacto, Subscricoes, ...utilizador }) => ({
    utilizador,
    tipoUtilizador: TipoUtilizador ?? null,
    morada: Morada ?? null,
    contacto: Contacto ?? null,
    subscricoes: Subscricoes ?? [],
  }))

  return result
}

export const getUtilizadorByNIF: GetUtilizadorByNIF<Pick<Utilizador, 'NIF' | 'EstadoUtilizador'>, Utilizador[]
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  if (!args.NIF) {
    throw new Error("Nif nao encontrado")
  }

  const utilizador = await context.entities.Utilizador.findFirst({
    where: { NIF: args.NIF },
    include: {
      Subscricoes: true,
    }
  })

  if(!utilizador) {
    throw new Error ("Utilizador nao encontrado")
  }

  if(!utilizador.EstadoUtilizador) {
    throw new Error("Utilizador Desabilitado, por favor contacte alguem")
  }

  return [utilizador]
}

export const getUtilizadoresInfoByTipo: GetUtilizadoresInfoByTipo<
  { 
    page: number,
    pageSize: number,
    searchTerm?: string,
    filters?: {
      estadoSubscricao?: 'ativa' | 'expirada' | 'todas',
      faixaEtaria?: {
        min: number,
        max: number
      }
    }
  },
  {
    data: {
      utilizador: Utilizador
      tipoUtilizador: TipoUtilizador
      morada: Morada
      contacto: Contacto
      subscricoes: Subscricao[]
    }[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
> = async ({ page, pageSize, searchTerm, filters }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const skip = (page - 1) * pageSize
  const take = pageSize

  const utilizadoresativos: any = {
    EstadoUtilizador: true,
    NumSocio: { not: null }
  }

  if (searchTerm) {
    utilizadoresativos.OR = [
      { Nome: { contains: searchTerm, mode: 'insensitive' } },
      { NIF: { contains: searchTerm, mode: 'insensitive' } },
      { Contacto: { Telemovel: { contains: searchTerm, mode: 'insensitive' } } }
    ]
  }

  if (filters?.faixaEtaria) {
    const hoje = new Date()
    const anoMax = hoje.getFullYear() - filters.faixaEtaria.min
    const anoMin = hoje.getFullYear() - filters.faixaEtaria.max
    
    utilizadoresativos.DataNascimento = {
      lte: new Date(anoMax, hoje.getMonth(), hoje.getDate()), 
      gte: new Date(anoMin, hoje.getMonth(), hoje.getDate()) 
    }
  }

  if (filters?.estadoSubscricao && filters.estadoSubscricao !== 'todas') {
    const estadoSub = filters.estadoSubscricao === 'ativa'
    
    utilizadoresativos.Subscricoes = {
      some: {
        EstadoSubscricao: estadoSub
      }
    }
  }

  const utilizadores = await context.entities.Utilizador.findMany({
    where: utilizadoresativos,
    orderBy: {
      id: 'desc',
    },
    include: {
      TipoUtilizador: true,
      Morada: {
        include: {
          CodigoPostal: true,
        },
      },
      Contacto: true,
      Subscricoes: true,
    },
    skip,
    take,
  })

  const totalUtilizadores = await context.entities.Utilizador.count({
    where: utilizadoresativos, 
  })

  const utilizadoresInfo = utilizadores.map(
    ({ TipoUtilizador, Morada, Contacto, Subscricoes, ...utilizador }) => ({
      utilizador,
      tipoUtilizador: TipoUtilizador!,
      morada: Morada!,
      contacto: Contacto!,
      subscricoes: Subscricoes,
    })
  )

  return {
    data: utilizadoresInfo,
    total: totalUtilizadores,
    page,
    pageSize,
    totalPages: Math.ceil(totalUtilizadores / pageSize),
  }
}


type CreateUtilizadorPayload = {
  Nome: string
  DataNascimento: Date
  NIF: string
  Imagem: string
  TipoUtilizadorId: number
  Morada: {
    Concelho: string
    Distrito: string
    CodigoPostal: {
      Localidade: string
    }
  }
  Contacto: {
    Email: string
    Telemovel: string
  }
}

export const createUtilizador: CreateUtilizador<CreateUtilizadorPayload, Utilizador> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const concelho = capitalize(args.Morada.Concelho)
  const distrito = capitalize(args.Morada.Distrito)

  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  try {
    let ultimoUtilizador = await context.entities.Utilizador.findFirst({
      orderBy: { NumSocio: 'desc' },
      select: { NumSocio: true },
      where: { NumSocio: { not: null } }
    })

    const proxNumSocio = (ultimoUtilizador?.NumSocio ?? 0) + 1

    const contacto = await context.entities.Contacto.create({
      data: {
        Email: args.Contacto.Email,
        Telemovel: args.Contacto.Telemovel,
      },
    })

    let codigoPostal = await context.entities.CodigoPostal.findFirst({
      where: { Localidade: args.Morada.CodigoPostal.Localidade },
    })

    if (!codigoPostal) {
      codigoPostal = await context.entities.CodigoPostal.create({
        data: { Localidade: args.Morada.CodigoPostal.Localidade },
      })
    }

    let morada = await context.entities.Morada.findFirst({
      where: { 
        Concelho: concelho,
        Distrito: distrito,
        CodigoPostalCodigoPostalId: codigoPostal.CodigoPostalId
      },
    })

    if (!morada) {
      morada = await context.entities.Morada.create({
        data: {
          Concelho: concelho,
          Distrito: distrito,
          CodigoPostalCodigoPostalId: codigoPostal.CodigoPostalId,
        },
      })
    }

    let imageUrl = args.Imagem
    if (args.Imagem && !args.Imagem.startsWith("http")) {
      imageUrl = await saveImageLocally(args.Imagem)
    }

    const utilizador = await context.entities.Utilizador.create({
      data: {
        NumSocio: proxNumSocio,
        Nome: args.Nome,
        DataNascimento: new Date(args.DataNascimento),
        NIF: args.NIF,
        Imagem: imageUrl,
        EstadoUtilizador: true,
        MoradaMoradaId: morada.MoradaId,
        ContactoContactoId: contacto.ContactoId,
        TipoUtilizadorTipoUtilizadorId: args.TipoUtilizadorId,
      },
    })
    
    await registarAuditLog('auditUtilizador',{
      entidade: 'Utilizador',
      operacao: 'CREATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: null,
      dadosDepois: utilizador,
      resultado: 'SUCCESS',
      mensagemErro: ""
    })

    return utilizador

  } catch (error) {
    await registarAuditLog('auditUtilizador',{
      entidade: 'Utilizador',
      operacao: 'CREATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: null,
      dadosDepois: null,
      resultado: 'FAILURE',
      mensagemErro: error instanceof Error ? error.message : JSON.stringify(error)
    })

    throw error
  }
}

type UpdateUtilizadorPayload = {
  id: number
  NumSocio: number
  Nome?: string
  DataNascimento?: Date
  NIF?: string
  Imagem?: string
  TipoUtilizadorId?: number
  Morada?: {
    Concelho?: string
    Distrito?: string
    CodigoPostal?: {
      Localidade?: string
    }
  }
  Contacto?: {
    Email?: string
    Telemovel?: string
  }
}

export const updateUtilizador: UpdateUtilizador<UpdateUtilizadorPayload, Utilizador> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const utilizador = await context.entities.Utilizador.findUnique({
    where: { id: args.id },
    include: { 
      Morada: true, 
      Contacto: true,
    }
  })

  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  if (!utilizador) {
    throw new Error("Utilizador não encontrado")
  }

  try {
    if (args.Contacto) {
      if (!utilizador.ContactoContactoId) {
        const novoContacto = await context.entities.Contacto.create({
          data: {
            Email: args.Contacto.Email || '',
            Telemovel: args.Contacto.Telemovel || '',
          }
        })

        await context.entities.Utilizador.update({
          where: { id: args.id },
          data: {
            ContactoContactoId: novoContacto.ContactoId
          }
        })
      } else {
        await context.entities.Contacto.update({
          where: { ContactoId: utilizador.ContactoContactoId },
          data: {
            Email: args.Contacto.Email,
            Telemovel: args.Contacto.Telemovel,
          }
        })
      }
    }

    if (args.Morada) {
      let codigoPostalId: number | null = null

      if (args.Morada.CodigoPostal?.Localidade) {
        let codigoPostal = await context.entities.CodigoPostal.findFirst({
          where: { Localidade: args.Morada.CodigoPostal.Localidade },
        })

        if (!codigoPostal) {
          codigoPostal = await context.entities.CodigoPostal.create({
            data: { Localidade: args.Morada.CodigoPostal.Localidade },
          })
        }

        codigoPostalId = codigoPostal.CodigoPostalId
      }

      const concelho = args.Morada.Concelho ? capitalize(args.Morada.Concelho) : null
      const distrito = args.Morada.Distrito ? capitalize(args.Morada.Distrito) : null

      let moradaId: number | null = null

      if (concelho || distrito || codigoPostalId) {
        if (!utilizador.MoradaMoradaId) {
          const novaMorada = await context.entities.Morada.create({
            data: {
              Concelho: concelho || '',
              Distrito: distrito || '',
              CodigoPostalCodigoPostalId: codigoPostalId || -1,
            }
          })
          moradaId = novaMorada.MoradaId
        } else {
          const moradaExistente = await context.entities.Morada.findFirst({
            where: {
              MoradaId: utilizador.MoradaMoradaId,
            },
          })

          if (moradaExistente) {
            await context.entities.Morada.update({
              where: { MoradaId: utilizador.MoradaMoradaId },
              data: {
                Concelho: concelho !== null ? concelho : undefined,
                Distrito: distrito !== null ? distrito : undefined,
                CodigoPostalCodigoPostalId: codigoPostalId !== null ? codigoPostalId : undefined,
              }
            })
            moradaId = moradaExistente.MoradaId
          }
        }
      }

      await context.entities.Utilizador.update({
        where: { id: utilizador.id },
        data: {
          MoradaMoradaId: moradaId,
        }
      })
    }

    let novoNumSocio = utilizador.NumSocio
    if (!utilizador.NumSocio) {
      const ultimoUtilizador = await context.entities.Utilizador.findFirst({
        orderBy: { NumSocio: 'desc' },
        select: { NumSocio: true },
        where: { NumSocio: { not: null } }
      })
      novoNumSocio = (ultimoUtilizador?.NumSocio ?? 0) + 1
    }
    
    let imageUrl = args.Imagem
    if (args.Imagem && !args.Imagem.startsWith("http")) {
      imageUrl = await saveImageLocally(args.Imagem)
    }

    const updatedUtilizador = await context.entities.Utilizador.update({
      where: { id: args.id },
      data: {
        Nome: args.Nome,
        NIF: args.NIF,
        NumSocio: novoNumSocio,
        DataNascimento: args.DataNascimento,
        Imagem: imageUrl,
      }
    })

    await registarAuditLog('auditUtilizador',{
      entidade: 'Utilizador',
      operacao: 'UPDATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: utilizador,
      dadosDepois: updatedUtilizador,
      resultado: 'SUCCESS',
      mensagemErro: ""
    })

    return updatedUtilizador

  } catch (error) {
    await registarAuditLog('auditUtilizador',{
      entidade: 'Utilizador',
      operacao: 'UPDATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: null,
      dadosDepois: null,
      resultado: 'FAILURE',
      mensagemErro: error instanceof Error ? error.message : JSON.stringify(error)
    })

    throw error
  }
}

export const updateUtilizadorByNIFNumSocio: UpdateUtilizadorByNIFNumSocio<UpdateUtilizadorPayload, Utilizador> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const utilizador = await context.entities.Utilizador.findUnique({
    where: { 
      NIF: args.NIF,
      NumSocio: args.NumSocio
    },
    include: { 
      Morada: true, 
      Contacto: true,
    }
  })

  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  if (!args.NIF || !args.NumSocio) {
    throw new Error("Necessario NIF e NumSocio para editar os seus dados")
  }

  if (!utilizador) {
    throw new Error("Utilizador não encontrado")
  }

  try {
    if (args.Contacto) {
    if (!utilizador.ContactoContactoId) {
      throw new Error("ContactoContactoId não encontrado")
    }

    await context.entities.Contacto.update({
      where: { ContactoId: utilizador.ContactoContactoId },
      data: {
        Email: args.Contacto.Email,
        Telemovel: args.Contacto.Telemovel,
      }
    })
  }

    let codigoPostalId: number | undefined
    if (args.Morada?.CodigoPostal?.Localidade) {
      let codigoPostal = await context.entities.CodigoPostal.findFirst({
        where: { Localidade: args.Morada.CodigoPostal.Localidade },
      })

      if (!codigoPostal) {
        codigoPostal = await context.entities.CodigoPostal.create({
          data: { Localidade: args.Morada.CodigoPostal.Localidade },
        })
      }

      codigoPostalId = codigoPostal.CodigoPostalId
    }

    if (args.Morada) {
      const concelho = capitalize(args.Morada.Concelho || "")
      const distrito = capitalize(args.Morada.Distrito || "")

      if (!codigoPostalId) {
        throw new Error("codigoPostalId não encontrado")
      }

      let morada = await context.entities.Morada.findFirst({
        where: {
          Concelho: concelho,
          Distrito: distrito,
          CodigoPostalCodigoPostalId: codigoPostalId,
        },
      })

      if (!morada) {
        morada = await context.entities.Morada.create({
          data: {
            Concelho: concelho,
            Distrito: distrito,
            CodigoPostalCodigoPostalId: codigoPostalId,
          },
        })
      }

      await context.entities.Utilizador.update({
        where: { id: utilizador.id },
        data: {
          MoradaMoradaId: morada.MoradaId,
        },
      })
    }

    const updatedUtilizador = await context.entities.Utilizador.update({
      where: { 
        NIF: args.NIF,
        NumSocio: args.NumSocio
      },
      data: {
        Nome: args.Nome,
      }
    })

    await registarAuditLog('auditUtilizador',{
      entidade: 'Utilizador',
      operacao: 'UPDATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: utilizador,
      dadosDepois: updatedUtilizador,
      resultado: 'SUCCESS',
      mensagemErro: ""
    })

    return updatedUtilizador

  } catch (error) {
      await registarAuditLog('auditUtilizador',{
        entidade: 'Utilizador',
        operacao: 'UPDATE',
        idUtilizadorResponsavel,
        parametrosRecebidos,
        dadosAntes: null,
        dadosDepois: null,
        resultado: 'FAILURE',
        mensagemErro: error instanceof Error ? error.message : JSON.stringify(error)
      })

      throw error
  }
}

type UpdateEstadoUtilizadorPayLoad = Pick<Utilizador, 'id' | 'EstadoUtilizador'>

export const updateEstadoUtilizador: UpdateEstadoUtilizador<UpdateEstadoUtilizadorPayLoad, Utilizador> = async (
  args,
  context,
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const utilizador = await context.entities.Utilizador.findFirst({
    where: { id: args.id }
  })

  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  if(!utilizador) {
    throw new Error("Utilizador nao encontrado")
  }

  try {
    const updatedEstadoUtilizador = await context.entities.Utilizador.update({
      where: { id: args.id },
      data: {
        EstadoUtilizador: !utilizador.EstadoUtilizador,
      }
    })

    await registarAuditLog('auditUtilizador',{
      entidade: 'Utilizador',
      operacao: 'UPDATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: utilizador,
      dadosDepois: updatedEstadoUtilizador,
      resultado: 'SUCCESS',
      mensagemErro: ""
    })

    return updatedEstadoUtilizador

  } catch (error) {
    await registarAuditLog('auditUtilizador',{
      entidade: 'Utilizador',
      operacao: 'UPDATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: null,
      dadosDepois: null,
      resultado: 'FAILURE',
      mensagemErro: error instanceof Error ? error.message : JSON.stringify(error)
    })

    throw error
  }
}
