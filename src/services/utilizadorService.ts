import { Contacto, Morada, TipoUtilizador, Utilizador, Subscricao} from 'wasp/entities'
import { 
  type GetUtilizadores, 
  type GetUtilizadorByNIF, 
  type GetUtilizadoresInfoByTipo, 
  type CreateUtilizador, 
  type UpdateUtilizador, 
  type GetUtilizadorDesabilitado,
  type UpdateEstadoUtilizador,
  type UpdateUtilizadorByNIFNumSocio,
  type GetUtilizadorInfoById,
} from 'wasp/server/operations'
import { capitalize, saveImageLocally } from './utils'
import { HttpError } from 'wasp/server'

export const getUtilizadores: GetUtilizadores<void, Utilizador[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }
  return context.entities.Utilizador.findMany({
    orderBy: { id: 'asc' },
  })
}

export const getUtilizadorDesabilitado: GetUtilizadorDesabilitado<void, Utilizador[]> = async(_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.Utilizador.findMany({
    where: { EstadoUtilizador: false }
  })
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

  try {
    if(!args.id) {
      throw new Error("ID do utilizador é obrigatório");
    }

    const utilizadores = await context.entities.Utilizador.findMany({
      where: {
        id: args.id,
      },
      include: {
        TipoUtilizador: true, 
        Morada: true,
        Contacto: true, 
        Subscricoes: true, 
      },
    });

    if (!utilizadores || utilizadores.length === 0) {
      return []
    }

    const result = utilizadores.map(({ TipoUtilizador, Morada, Contacto, Subscricoes, ...utilizador }) => ({
      utilizador,
      tipoUtilizador: TipoUtilizador ?? null,
      morada: Morada ?? null,
      contacto: Contacto ?? null,
      subscricoes: Subscricoes ?? [],
    }));

    return result;
  } catch (error) {
    console.error("Erro ao buscar utilizador:", error);
    throw error; 
  }
}

export const getUtilizadorByNIF: GetUtilizadorByNIF<Pick<Utilizador, 'NIF' | 'EstadoUtilizador'>, Utilizador[]
> = async (args, context) => {
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
    tipoUtilizadorId?: number
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
> = async ({ page, pageSize, searchTerm, tipoUtilizadorId }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const skip = (page - 1) * pageSize
  const take = pageSize

  const utilizadoresAtivos: any = {
    EstadoUtilizador: true,
  }

  if (tipoUtilizadorId) {
    utilizadoresAtivos.TipoUtilizador = {
      TipoUtilizadorId: tipoUtilizadorId,
    }
  }

  if (searchTerm) {
    utilizadoresAtivos.OR = [
      { Nome: { contains: searchTerm, mode: 'insensitive' } },
      { NIF: { contains: searchTerm, mode: 'insensitive' } },
      { Contacto: { Telemovel: { contains: searchTerm, mode: 'insensitive' } } }
    ]
  }

  const utilizadores = await context.entities.Utilizador.findMany({
    where: utilizadoresAtivos,
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
    where: utilizadoresAtivos, 
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

  return utilizador
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

  if (!utilizador) {
    throw new Error("Utilizador não encontrado")
  }

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

    if (codigoPostalId === undefined) {
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
    where: { id: args.id },
    data: {
      Nome: args.Nome,
      TipoUtilizadorTipoUtilizadorId: args.TipoUtilizadorId
    }
  })

  return updatedUtilizador
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

  if (!args.NIF || !args.NumSocio) {
    throw new Error("Necessario NIF e NumSocio para editar os seus dados")
  }

  if (!utilizador) {
    throw new Error("Utilizador não encontrado")
  }

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

    if (codigoPostalId === undefined) {
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

  return updatedUtilizador
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

  if(!utilizador) {
    throw new Error("Utilizador nao encontrado")
  }

  const updatedEstadoUtilizador = await context.entities.Utilizador.update({
    where: { id: args.id },
    data: {
      EstadoUtilizador: !utilizador.EstadoUtilizador,
    }
  })

  return updatedEstadoUtilizador
}
