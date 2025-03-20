import { Contacto, Morada, TipoUtilizador, Utilizador, Subscricao } from 'wasp/entities'
import { 
  type GetUtilizadores, 
  type GetUtilizadorByNIF, 
  type GetUtilizadoresInfo, 
  type CreateUtilizador, 
  type UpdateUtilizador, 
  type GetUtilizadorDesabilitado,
  type UpdateEstadoUtilizador
} from 'wasp/server/operations'
import { capitalize } from './utils'

export const getUtilizadores: GetUtilizadores<void, Utilizador[]> = async (_args, context) => {
  return context.entities.Utilizador.findMany({
    orderBy: { UtilizadorId: 'asc' },
  })
}

export const getUtilizadorDesabilitado: GetUtilizadorDesabilitado<void, Utilizador[]> = async(_args, context) => {
  return context.entities.Utilizador.findMany({
    where: { EstadoUtilizador: false }
  })
}

export const getUtilizadorByNIF: GetUtilizadorByNIF<Pick<Utilizador, 'NIF' | 'EstadoUtilizador'>, Utilizador[]
> = async (args, context) => {
  if (!args.NIF) {
    throw new Error("Nif nao encontrado")
  }

  const utilizador = await context.entities.Utilizador.findFirst({
    where: { NIF: args.NIF },
  })

  if(!utilizador) {
    throw new Error ("Utilizador nao encontrado")
  }

  if(!utilizador.EstadoUtilizador) {
    throw new Error("Utilizador Desabilitado, por favor contacte alguem")
  }

  return [utilizador]
}

export const getUtilizadoresInfo: GetUtilizadoresInfo<void, Array<{ 
  utilizador: Utilizador, 
  tipoUtilizador: TipoUtilizador,
  morada: Morada, 
  contacto: Contacto,
  subscricoes: Subscricao[]
}>> = async (_args, context) => {
  const utilizadores = await context.entities.Utilizador.findMany({
    where: {
      EstadoUtilizador: true,
    },

    include: {
      TipoUtilizador: true, 
      Morada: true,
      Contacto: true, 
      Subscricoes: true, 
    }
  })

  const UtilizadoresInfo = utilizadores.map(({ TipoUtilizador, Morada, Contacto, Subscricoes, ...utilizador }) => ({
    utilizador,
    tipoUtilizador: TipoUtilizador!,
    morada: Morada!,
    contacto: Contacto!,
    subscricoes: Subscricoes, 
  }))

  return UtilizadoresInfo;
}

type CreateUtilizadorPayload = {
  Nome: string
  DataNascimento: Date
  NIF: string
  PalavraPasse: string
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
  const concelho = capitalize(args.Morada.Concelho)
  const distrito = capitalize(args.Morada.Distrito)

  const contacto = await context.entities.Contacto.create({
    data: {
      Email: args.Contacto.Email,
      Telemovel: args.Contacto.Telemovel,
    }
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
    where: { Concelho: args.Morada.Concelho,
     }
  })

  if (!morada) {
    morada = await context.entities.Morada.create({
      data: {
        Concelho: concelho,
        Distrito: distrito,
        CodigoPostalCodigoPostalId: codigoPostal.CodigoPostalId,
      }
    })
  }

  const utilizador = await context.entities.Utilizador.create({
    data: {
      Nome: args.Nome,
      DataNascimento: new Date(args.DataNascimento),
      NIF: args.NIF,
      PalavraPasse: args.PalavraPasse,
      EstadoUtilizador: true,
      MoradaMoradaId: morada.MoradaId,
      ContactoContactoId: contacto.ContactoId,
      TipoUtilizadorTipoUtilizadorId: args.TipoUtilizadorId
    }
  })

  return utilizador
}

type UpdateUtilizadorPayload = {
  UtilizadorId: number
  Nome?: string
  DataNascimento?: Date
  NIF?: string
  PalavraPasse?: string
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
  const utilizador = await context.entities.Utilizador.findUnique({
    where: { UtilizadorId: args.UtilizadorId },
    include: { 
      Morada: true, 
      Contacto: true,
    }
  })

  if (!utilizador) {
    throw new Error("Utilizador não encontrado");
  }

  if (args.Contacto) {
    if (!utilizador.ContactoContactoId) {
      throw new Error("ContactoContactoId não encontrado");
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

    codigoPostalId = codigoPostal.CodigoPostalId;
  }

  if (args.Morada) {
    const concelho = capitalize(args.Morada.Concelho || "");
    const distrito = capitalize(args.Morada.Distrito || "");

    if (codigoPostalId === undefined) {
      throw new Error("codigoPostalId não encontrado");
    }

    let morada = await context.entities.Morada.findFirst({
      where: {
        Concelho: concelho,
        Distrito: distrito,
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
      where: { UtilizadorId: utilizador.UtilizadorId },
      data: {
        MoradaMoradaId: morada.MoradaId,
      },
    })
  }

  const updatedUtilizador = await context.entities.Utilizador.update({
    where: { UtilizadorId: args.UtilizadorId },
    data: {
      Nome: args.Nome,
      TipoUtilizadorTipoUtilizadorId: args.TipoUtilizadorId
    }
  })

  return updatedUtilizador
}

type UpdateEstadoUtilizadorPayLoad = Pick<Utilizador, 'UtilizadorId' | 'EstadoUtilizador'>

export const updateEstadoUtilizador: UpdateEstadoUtilizador<UpdateEstadoUtilizadorPayLoad, Utilizador> = async (
  args,
  context,
) => {
  const utilizador = await context.entities.Utilizador.findFirst({
    where: { UtilizadorId: args.UtilizadorId }
  })

  if(!utilizador) {
    throw new Error("Utilizador nao encontrado")
  }

  const updatedEstadoUtilizador = await context.entities.Utilizador.update({
    where: { UtilizadorId: args.UtilizadorId },
    data: {
      EstadoUtilizador: !utilizador.EstadoUtilizador,
    }
  })

  return updatedEstadoUtilizador
}
