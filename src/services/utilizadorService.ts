import { Contacto, Morada, TipoUtilizador, Utilizador, Subscricao } from 'wasp/entities'
import { type GetUtilizadores, type GetUtilizadorByNIF, type GetUtilizadoresInfo, type CreateUtilizador, type UpdateUtilizador } from 'wasp/server/operations'

export const getUtilizadores: GetUtilizadores<void, Utilizador[]> = async (_args, context) => {
  return context.entities.Utilizador.findMany({
    orderBy: { UtilizadorId: 'asc' },
  })
}

export const getUtilizadorByNIF: GetUtilizadorByNIF<Pick<Utilizador, 'NIF'>, Utilizador[]
> = async (args, context) => {
  if (!args.NIF) return [];

  return context.entities.Utilizador.findMany({
    where: { NIF: args.NIF}
  })
}

export const getUtilizadoresInfo: GetUtilizadoresInfo<void, Array<{ 
  utilizador: Utilizador, 
  tipoUtilizador: TipoUtilizador,
  morada: Morada, 
  contacto: Contacto,
  subscricoes: Subscricao[]
}>> = async (_args, context) => {
  const utilizadores = await context.entities.Utilizador.findMany({
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
    where: { Concelho: args.Morada.Concelho }
  })

  if (!morada) {
    morada = await context.entities.Morada.create({
      data: {
        Concelho: args.Morada.Concelho,
        Distrito: args.Morada.Distrito,
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

  if (args.Contacto) {
    await context.entities.Contacto.update({
      where: { ContactoId: utilizador?.ContactoContactoId },
      data: {
        Email: args.Contacto.Email,
        Telemovel: args.Contacto.Telemovel,
      }
    })
  }

  if(!args.Morada?.CodigoPostal) {
    throw new Error("Codigo Postal nao encontrado")
  }

  let codigoPostalId: number | undefined;
  if (args.Morada.CodigoPostal.Localidade) {
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
    await context.entities.Morada.update({
      where: { MoradaId: utilizador?.MoradaMoradaId },
      data: {
        Concelho: args.Morada.Concelho,
        Distrito: args.Morada.Distrito,
        CodigoPostalCodigoPostalId: codigoPostalId,
      }
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